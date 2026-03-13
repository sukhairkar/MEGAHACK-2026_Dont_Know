import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';
import { FIRReport } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    if (!auth || auth.userType !== 'citizen') {
      return NextResponse.json(
        { error: 'Unauthorized - Citizen access required' },
        { status: 401 }
      );
    }

    const citizen = db.getCitizenById(auth.userId);
    if (!citizen) {
      return NextResponse.json({ error: 'Citizen profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      region,
      occurrenceDay,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      occurrenceAddress,
      directionFromPS,
      distanceFromPS,
      beatNo,
      infoReceivedDate,
      gdEntryNo,
      gdDateTime,
      delayReason,
      outsidePSName,
      outsideDistrict,
      firstInformationContents,
      act,
      section,
      complainantRelativeName,
      complainantBirthDate,
      complainantNationality,
      complainantOccupation,
      complainantCurrentAddress,
      complainantPermanentAddress,
      complainantIdType,
      complainantIdNumber,
      infoType,
      
      // Structured Arrays
      accused,
      properties,
    } = body;

    // Validation for critical fields
    if (!region || !firstInformationContents || !occurrenceAddress || !act || !section) {
      return NextResponse.json({ error: 'Missing critical FIR fields' }, { status: 400 });
    }

    // Calculate total property value from structured list
    const calculatedTotalValue = properties?.reduce((sum: number, p: any) => sum + (parseFloat(p.value) || 0), 0) || 0;

    const firId = `fir-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const firNumber = db.generateFIRNumber();
    const regionData = db.getRegionDetails(region);

    const fir: FIRReport = {
      id: firId,
      firNumber,
      district: regionData.district,
      policeStation: regionData.policeStation,
      year: new Date().getFullYear(),
      firDateTime: new Date(),
      infoType: infoType || 'Oral / Online',
      citizenId: auth.userId,
      region: region,
      
      occurrenceDay,
      dateFrom: new Date(dateFrom),
      dateTo: dateTo ? new Date(dateTo) : undefined,
      timeFrom,
      timeTo,
      occurrenceAddress,
      directionFromPS,
      distanceFromPS,
      beatNo,

      infoReceivedDate: infoReceivedDate ? new Date(infoReceivedDate) : new Date(),
      gdEntryNo: gdEntryNo || `GD/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`,
      gdDateTime: gdDateTime ? new Date(gdDateTime) : new Date(),
      delayReason,

      outsidePSName,
      outsideDistrict,
      totalPropertyValue: calculatedTotalValue,
      firstInformationContents,

      act,
      section,

      // Complainant Details (from Citizen Profile + extra inputs)
      complainantName: citizen.fullName,
      complainantRelativeName,
      complainantBirthDate: new Date(complainantBirthDate),
      complainantNationality,
      complainantUidNumber: citizen.aadhaar,
      complainantOccupation,
      complainantMobile: citizen.phone,
      complainantCurrentAddress: complainantCurrentAddress || occurrenceAddress,
      complainantPermanentAddress,
      complainantIdType,
      complainantIdNumber,

      // Structured Data
      accused: accused || [],
      properties: properties || [],

      // Backward Compatibility & Flat fields
      accusedName: accused && accused.length > 0 ? accused[0].name : 'Unknown',
      
      isApproved: false,
      
      // Legacy fields
      incidentType: act + ' - ' + section,
      incidentDate: new Date(dateFrom),
      incidentLocation: occurrenceAddress,
      description: firstInformationContents,
      status: 'Pending',
      priority: 'Medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.saveFIR(fir);

    // Auto-assignment logic
    const officers = db.getOfficersByRegion(region);
    if (officers.length > 0) {
      const officer = officers[0];
      fir.assignedOfficerId = officer.id;
      fir.investigationOfficerName = officer.fullName;
      fir.investigationOfficerRank = officer.designation;
      fir.investigationOfficerNumber = officer.badge;
      fir.status = 'Open';
      db.saveFIR(fir);
    }

    return NextResponse.json(
      { message: 'FIR submitted successfully', fir: { id: fir.id, firNumber: fir.firNumber } },
      { status: 201 }
    );
  } catch (error) {
    console.error('FIR submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

