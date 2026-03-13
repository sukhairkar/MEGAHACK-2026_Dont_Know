import { Citizen, PoliceOfficer, FIRReport, Session } from './schema';

// In-memory database (in production, this would be a real database)
class Database {
  private citizens: Map<string, Citizen> = new Map();
  private officers: Map<string, PoliceOfficer> = new Map();
  private firReports: Map<string, FIRReport> = new Map();
  private sessions: Map<string, Session> = new Map();
  private pendingVerifications: Map<string, { otp: string; expiry: Date; phone: string }> = new Map();
  private pendingPhoneVerifications: Map<string, { otp: string; expiry: Date }> = new Map();
  private firCounter: number = 1000;

  // Phone verification operations
  savePhoneVerification(phone: string, data: { otp: string; expiry: Date }): void {
    this.pendingPhoneVerifications.set(phone, data);
  }

  getPhoneVerification(phone: string): { otp: string; expiry: Date } | null {
    const data = this.pendingPhoneVerifications.get(phone);
    if (!data) return null;
    if (new Date() > data.expiry) {
      this.pendingPhoneVerifications.delete(phone);
      return null;
    }
    return data;
  }

  deletePhoneVerification(phone: string): void {
    this.pendingPhoneVerifications.delete(phone);
  }

  // Pending verification operations
  savePendingVerification(aadhaar: string, data: { otp: string; expiry: Date; phone: string }): void {
    this.pendingVerifications.set(aadhaar, data);
  }

  getPendingVerification(aadhaar: string): { otp: string; expiry: Date; phone: string } | null {
    const data = this.pendingVerifications.get(aadhaar);
    if (!data) return null;
    if (new Date() > data.expiry) {
      this.pendingVerifications.delete(aadhaar);
      return null;
    }
    return data;
  }

  deletePendingVerification(aadhaar: string): void {
    this.pendingVerifications.delete(aadhaar);
  }

  getCitizenByPhone(phone: string): Citizen | null {
    for (const citizen of this.citizens.values()) {
      if (citizen.phone === phone) return citizen;
    }
    return null;
  }

  // Citizen operations
  getCitizenByEmail(email: string): Citizen | null {
    for (const citizen of this.citizens.values()) {
      if (citizen.email.toLowerCase() === email.toLowerCase()) {
        return citizen;
      }
    }
    return null;
  }

  getCitizenByAadhaar(aadhaar: string): Citizen | null {
    for (const citizen of this.citizens.values()) {
      if (citizen.aadhaar === aadhaar) {
        return citizen;
      }
    }
    return null;
  }

  getCitizenById(id: string): Citizen | null {
    return this.citizens.get(id) || null;
  }

  saveCitizen(citizen: Citizen): void {
    this.citizens.set(citizen.id, citizen);
  }

  // Officer operations
  getOfficerByEmail(email: string): PoliceOfficer | null {
    for (const officer of this.officers.values()) {
      if (officer.email.toLowerCase() === email.toLowerCase()) {
        return officer;
      }
    }
    return null;
  }

  getOfficerById(id: string): PoliceOfficer | null {
    return this.officers.get(id) || null;
  }

  getOfficersByRegion(region: string): PoliceOfficer[] {
    const result: PoliceOfficer[] = [];
    for (const officer of this.officers.values()) {
      if (officer.region.toLowerCase() === region.toLowerCase()) {
        result.push(officer);
      }
    }
    return result;
  }

  saveOfficer(officer: PoliceOfficer): void {
    this.officers.set(officer.id, officer);
  }

  getOfficerByBadge(badge: string): PoliceOfficer | null {
    for (const officer of this.officers.values()) {
      if (officer.badge.toLowerCase() === badge.toLowerCase()) return officer;
    }
    return null;
  }

  // FIR operations
  saveFIR(fir: FIRReport): void {
    this.firReports.set(fir.id, fir);
  }

  getFIRById(id: string): FIRReport | null {
    return this.firReports.get(id) || null;
  }

  getFIRByNumber(firNumber: string): FIRReport | null {
    for (const fir of this.firReports.values()) {
      if (fir.firNumber === firNumber) {
        return fir;
      }
    }
    return null;
  }

  getFIRsByCitizen(citizenId: string): FIRReport[] {
    const result: FIRReport[] = [];
    for (const fir of this.firReports.values()) {
      if (fir.citizenId === citizenId) {
        result.push(fir);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getFIRsByRegion(region: string): FIRReport[] {
    const result: FIRReport[] = [];
    for (const fir of this.firReports.values()) {
      if (fir.region.toLowerCase() === region.toLowerCase()) {
        result.push(fir);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Region lookup (demo data)
  private regionDetails: Record<string, { district: string; policeStation: string }> = {
    'Borivli': { district: 'Mumbai Suburban', policeStation: 'Borivli Police Station' },
    'Dahisar': { district: 'Mumbai Suburban', policeStation: 'Dahisar Police Station' },
    'Vasai': { district: 'Palghar', policeStation: 'Vasai Police Station' },
  };

  getRegionDetails(region: string) {
    return this.regionDetails[region] || { district: 'Unknown', policeStation: 'Unknown Branch' };
  }

  generateFIRNumber(): string {
    const year = new Date().getFullYear();
    const number = ++this.firCounter;
    return `FIR/${year}/MH/${number.toString().padStart(6, '0')}`;
  }


  // Session operations
  saveSession(session: Session): void {
    this.sessions.set(session.id, session);
  }

  getSession(id: string): Session | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (new Date() > session.expiresAt) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  deleteSession(id: string): void {
    this.sessions.delete(id);
  }

  // Seed test data
  seedTestData(): void {
    // Test police officers
    const testOfficers: PoliceOfficer[] = [
      {
        id: 'officer-001',
        badge: 'JR001',
        email: 'officer.borivli@police.gov',
        passwordHash: '',
        fullName: 'Anil Kumar',
        phone: '9876543210',
        stationName: 'Borivli Police Station',
        stationCode: 'BVL-01',
        department: 'Local Police Station',
        district: 'Mumbai Suburban',
        region: 'Borivli',
        designation: 'Investigation Officer',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'officer-002',
        badge: 'JR002',
        email: 'officer.dahisar@police.gov',
        passwordHash: '',
        fullName: 'Priya Sharma',
        phone: '9876543211',
        stationName: 'Dahisar Police Station',
        stationCode: 'DHS-01',
        department: 'Crime Branch',
        district: 'Mumbai Suburban',
        region: 'Dahisar',
        designation: 'Investigation Officer',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'officer-003',
        badge: 'JR003',
        email: 'officer.vasai@police.gov',
        passwordHash: '',
        fullName: 'Rajesh Patel',
        phone: '9876543212',
        stationName: 'Vasai Police Station',
        stationCode: 'VSI-01',
        department: 'Local Police Station',
        district: 'Palghar',
        region: 'Vasai',
        designation: 'Investigation Officer',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    testOfficers.forEach((officer) => this.saveOfficer(officer));

    // Demo Citizen
    this.saveCitizen({
      id: 'demo-citizen-id',
      aadhaar: '123456789012',
      email: 'demo_citizen@test.com',
      phone: '9876543210',
      fullName: 'Demo Citizen',
      passwordHash: '$2a$10$w81S88XN.8mY.51tX3Y4G.qN0q8m6n8p3.j2m5s7u9e1v3w4x5y6z', // password123
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Singleton instance
export const db = new Database();
db.seedTestData();
