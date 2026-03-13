import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';
import { supabase } from '@/lib/supabase';
import { exec } from 'child_process';
import path from 'path';

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
       // Fallback for demo if citizen isn't in memory but is authenticated (cookie exists)
       // In a real app, we'd fetch from Supabase here too.
    }

    const body = await request.json();
    console.log('--- FIR Submission Triggered ---');
    console.log('Request Body:', JSON.stringify(body, null, 2));

    const {
      city,
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
      complainantName,
      complainantMobile,
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

    // Helper to handle empty strings for SQL nullability
    const toNull = (val: any) => (val === '' || val === undefined || val === null ? null : val);

    // 1. Insert into fir_reports
    // 0. Intelligent Jurisdiction Mapping (Heuristic for Demo)
    const getJurisdiction = (cityStr: string) => {
      const c = cityStr?.toLowerCase() || '';
      
      // Explicit Strict City-to-Station Mappings
      if (c.includes('vasai')) return { district: 'Palghar', policeStation: 'Vasai Road Police Station' };
      if (c.includes('virar')) return { district: 'Palghar', policeStation: 'Virar Police Station' };
      if (c.includes('colaba')) return { district: 'Mumbai City', policeStation: 'Colaba Police Station' };
      if (c.includes('andheri')) return { district: 'Mumbai Suburban', policeStation: 'Andheri Police Station' };
      if (c.includes('borivali')) return { district: 'Mumbai Suburban', policeStation: 'Borivali Police Station' };
      if (c.includes('dahisar')) return { district: 'Mumbai Suburban', policeStation: 'Dahisar Police Station' };
      if (c.includes('bandra')) return { district: 'Mumbai Suburban', policeStation: 'Bandra Police Station' };
      if (c.includes('malad')) return { district: 'Mumbai Suburban', policeStation: 'Malad Police Station' };
      if (c.includes('kandivali')) return { district: 'Mumbai Suburban', policeStation: 'Kandivali Police Station' };
      
      return { 
        district: c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Mumbai City', 
        policeStation: c ? `${c.charAt(0).toUpperCase() + c.slice(1)} Police Station` : 'Central Police Station' 
      };
    };

    const juris = getJurisdiction(city);
    const firNumber = db.generateFIRNumber();
    const gdNo = gdEntryNo || `GD/${new Date().getFullYear()}/${Math.floor(Math.random() * 90000) + 10000}`;

    console.log('Inserting into fir_reports...');
    const { data: firRow, error: firError } = await supabase
      .from('fir_reports')
      .insert({
        district: juris.district,
        fir_no: firNumber,
        fir_datetime: new Date(),
        police_station: juris.policeStation,
        year: new Date().getFullYear(),
        info_type: infoType || 'Oral / Online',
        occurrence_day: toNull(occurrenceDay),
        date_from: dateFrom ? new Date(dateFrom) : null,
        date_to: dateTo ? new Date(dateTo) : null,
        time_from: toNull(timeFrom),
        time_to: toNull(timeTo),
        info_received_date: infoReceivedDate ? new Date(infoReceivedDate) : new Date(),
        gd_entry_no: gdNo,
        gd_datetime: gdDateTime ? new Date(gdDateTime) : new Date(),
        direction_from_ps: toNull(directionFromPS),
        distance_from_ps: toNull(distanceFromPS),
        beat_no: toNull(beatNo),
        occurrence_address: occurrenceAddress,
        outside_ps_name: toNull(outsidePSName),
        outside_district: toNull(outsideDistrict),
        delay_reason: toNull(delayReason),
        total_property_value: properties?.reduce((sum: number, p: any) => sum + (parseFloat(p.value) || 0), 0) || 0,
        first_information_contents: firstInformationContents,
        is_approved: false
      })
      .select('id')
      .single();

    if (firError) {
      console.error('Supabase fir_reports insert error:', firError);
      throw firError;
    }
    const firId = firRow.id;
    console.log('FIR Report inserted with ID:', firId);

    // --- Background: Trigger PDF Generator ---
    try {
      // Find the absolute path to the generator
      const generatorPath = path.resolve(process.cwd(), '..', 'fir_generator', 'main.py');
      const command = `python "${generatorPath}" --fir_id ${firId}`;
      console.log('--- Triggering Backend PDF Generator ---');
      console.log('Command:', command);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`[Generator] CRITICAL FAILURE: ${error.message}`);
          console.error(`[Generator] STDERR: ${stderr}`);
          return;
        }
        console.log(`[Generator] EXECUTION SUCCESS`);
        console.log(`[Generator] STDOUT: ${stdout}`);
        if (stderr) console.warn(`[Generator] WARNING: ${stderr}`);
      });
    } catch (genErr) {
      console.error('Failed to initiate PDF generator trigger:', genErr);
    }

    // 2. Insert into fir_sections
    const { error: sectionError } = await supabase
      .from('fir_sections')
      .insert({
        fir_id: firId,
        act: act,
        section: section
      });
    if (sectionError) console.error('Error inserting section:', sectionError);

    // 3. Insert into complainants
    console.log('Inserting into complainants...');
    const { data: complainantRow, error: complainantError } = await supabase
      .from('complainants')
      .insert({
        fir_id: firId,
        name: complainantName || 'Unknown Name',
        relative_name: toNull(complainantRelativeName),
        birth_date: complainantBirthDate ? new Date(complainantBirthDate) : null,
        nationality: complainantNationality || 'Indian',
        uid_number: complainantIdType === 'Aadhaar Card' ? toNull(complainantIdNumber) : null,
        occupation: toNull(complainantOccupation),
        mobile: toNull(complainantMobile),
        current_address: toNull(complainantCurrentAddress),
        permanent_address: toNull(complainantPermanentAddress)
      })
      .select('id')
      .single();
    
    if (complainantError) {
      console.error('Supabase complainants insert error:', complainantError);
      throw complainantError;
    }
    const complainantId = complainantRow.id;
    console.log('Complainant inserted with ID:', complainantId);

    // 4. Insert into complainant_ids
    const { error: idError } = await supabase
      .from('complainant_ids')
      .insert({
        complainant_id: complainantId,
        id_type: toNull(complainantIdType),
        id_number: toNull(complainantIdNumber)
      });
    if (idError) console.error('Error inserting id:', idError);

    // 5. Insert into accused (multiple)
    if (accused && accused.length > 0) {
      const accusedRows = accused.map((a: any) => ({
        fir_id: firId,
        name: a.name || 'Unknown',
        alias: toNull(a.alias),
        relative_name: toNull(a.relativeName),
        present_address: toNull(a.presentAddress)
      }));
      const { error: accusedError } = await supabase.from('accused').insert(accusedRows);
      if (accusedError) console.error('Error inserting accused:', accusedError);
    }

    // 6. Insert into properties (multiple)
    if (properties && properties.length > 0) {
      const propertyRows = properties.map((p: any) => ({
        fir_id: firId,
        property_category: toNull(p.category),
        property_type: toNull(p.type),
        description: toNull(p.description),
        value: parseFloat(p.value) || 0
      }));
      const { error: propertyError } = await supabase.from('properties').insert(propertyRows);
      if (propertyError) console.error('Error inserting properties:', propertyError);
    }

    return NextResponse.json(
      { 
        message: 'FIR submitted and persisted to Supabase successfully', 
        fir: { id: firId, firNumber: firNumber } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('FIR submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

