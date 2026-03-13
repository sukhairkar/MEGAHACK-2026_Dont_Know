// Database schema types and interfaces

export interface Citizen {
  id: string;
  aadhaar: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash: string;
  verified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliceOfficer {
  id: string;
  badge: string;
  email: string;
  passwordHash: string;
  fullName: string;
  region: string; // Branch/Region like "Borivli", "Dahisar", "Vasai"
  designation: string; // Investigation Officer, Inspector, etc.
  phone: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccusedDetails {
  id: string;
  name: string;
  alias?: string;
  presentAddress?: string;
  relativeName?: string;
}

export interface PropertyDetails {
  id: string;
  value: number;
  category: string;
  type: string;
  description: string;
}

export interface FIRReport {
  id: string;
  firNumber: string; // Unique FIR number (system generated)
  district: string; // Auto-fetched from officer/system
  policeStation: string; // Auto-fetched from officer/system
  year: number; // system generated
  firDateTime: Date; // system generated
  infoType: string; // Written / Oral
  
  citizenId: string;
  region: string; // General region for filtering
  assignedOfficerId?: string;

  // Occurrence of Offence
  occurrenceDay: string;
  dateFrom: Date;
  dateTo?: Date;
  timeFrom: string;
  timeTo?: string;
  occurrenceAddress: string;
  directionFromPS: string;
  distanceFromPS: string;
  beatNo: string;

  // Information Received
  infoReceivedDate: Date;
  gdEntryNo: string;
  gdDateTime: Date;
  delayReason?: string;

  // Place of Occurrence
  outsidePSName?: string;
  outsideDistrict?: string;

  // FIR Contents
  firstInformationContents: string;

  // Investigation/Court
  investigationOfficerName?: string;
  investigationOfficerRank?: string;
  investigationOfficerNumber?: string;
  courtDispatchDateTime?: Date;

  // Legal Details
  act: string;
  section: string;

  // Complainant Details (mapped from Citizen)
  complainantName: string;
  complainantRelativeName: string;
  complainantBirthDate: Date;
  complainantNationality: string;
  complainantUidNumber: string; // Aadhaar
  complainantPassportNumber?: string;
  complainantPassportIssueDate?: Date;
  complainantPassportIssuePlace?: string;
  complainantOccupation: string;
  complainantMobile: string;
  complainantCurrentAddress: string;
  complainantPermanentAddress: string;
  complainantIdType: string;
  complainantIdNumber: string;

  // NEW: Multi-entry support
  accused: AccusedDetails[];
  properties: PropertyDetails[];

  // Legacy fields (kept for compatibility or internal use)
  accusedName?: string; // Kept for simple view compatibility
  totalPropertyValue: number;
  
  uidbNumber?: string;
  isApproved: boolean;
  pdfUrl?: string;

  // Legacy fields
  incidentType: string;
  incidentDate: Date;
  incidentLocation: string;
  description: string;
  status: 'Open' | 'Under Investigation' | 'Closed' | 'Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}


export interface Session {
  id: string;
  token: string;
  userId: string;
  userType: 'citizen' | 'officer';
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthPayload {
  userId: string;
  userType: 'citizen' | 'officer';
  email: string;
  region?: string;
  iat: number;
  exp: number;
}
