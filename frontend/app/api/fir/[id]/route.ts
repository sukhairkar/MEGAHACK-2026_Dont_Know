import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: firId } = await params;
    
    // Fetch from Supabase with all related entities
    const { data: fir, error: firError } = await supabase
      .from('fir_reports')
      .select(`
        *,
        complainants (
          *,
          complainant_ids (*)
        ),
        accused (*),
        properties (*),
        fir_sections (*),
        inquest_reports (*)
      `)
      .eq('id', firId)
      .single();

    if (firError || !fir) {
      return NextResponse.json({ error: 'FIR Not Found' }, { status: 404 });
    }

    // Station-locked access control
    if (auth.userType === 'officer') {
      if (fir.police_station !== auth.region) {
        return NextResponse.json(
          { error: `Unauthorized - This case belongs to ${fir.police_station}` },
          { status: 403 }
        );
      }
    }

    // Map to frontend expected format (FIRReport interface)
    const enrichedFir = {
      id: fir.id,
      firNumber: fir.fir_no,
      district: fir.district,
      policeStation: fir.police_station,
      year: fir.year,
      firDateTime: fir.fir_datetime,
      infoType: fir.info_type,
      totalPropertyValue: fir.total_property_value || 0,
      
      occurrenceDay: fir.occurrence_day,
      dateFrom: fir.date_from,
      dateTo: fir.date_to,
      timeFrom: fir.time_from,
      timeTo: fir.time_to,
      occurrenceAddress: fir.occurrence_address,
      directionFromPS: fir.direction_from_ps,
      distanceFromPS: fir.distance_from_ps,
      beatNo: fir.beat_no,

      infoReceivedDate: fir.info_received_date,
      gdEntryNo: fir.gd_entry_no,
      gdDateTime: fir.gd_datetime,
      delayReason: fir.delay_reason,

      outsidePSName: fir.outside_ps_name,
      outsideDistrict: fir.outside_district,

      firstInformationContents: fir.first_information_contents || fir.incident_details,
      notes: fir.first_information_contents || fir.incident_details,

      // Legal Details
      sections: (fir.fir_sections || []).map((s: any) => ({
         id: s.id,
         act: s.act,
         section: s.section
      })),

      // Investigative Metadata
      investigationOfficerName: fir.investigation_officer_name,
      investigationOfficerRank: fir.investigation_officer_rank,
      investigationOfficerNumber: fir.investigation_officer_number,
      courtDispatchDateTime: fir.court_dispatch_datetime,

      // Complainant Details (using first record from join)
      complainantName: fir.complainants?.[0]?.name,
      complainantRelativeName: fir.complainants?.[0]?.relative_name,
      complainantBirthDate: fir.complainants?.[0]?.birth_date,
      complainantNationality: fir.complainants?.[0]?.nationality,
      complainantUidNumber: fir.complainants?.[0]?.uid_number,
      complainantPassportNumber: fir.complainants?.[0]?.passport_number,
      complainantPassportIssueDate: fir.complainants?.[0]?.passport_issue_date,
      complainantPassportIssuePlace: fir.complainants?.[0]?.passport_issue_place,
      complainantOccupation: fir.complainants?.[0]?.occupation,
      complainantMobile: fir.complainants?.[0]?.mobile,
      complainantCurrentAddress: fir.complainants?.[0]?.current_address,
      complainantPermanentAddress: fir.complainants?.[0]?.permanent_address,

      // Complainant IDs Table
      complainantIds: (fir.complainants?.[0]?.complainant_ids || []).map((cid: any) => ({
        id: cid.id,
        idType: cid.id_type,
        idNumber: cid.id_number
      })),

      // Inquest Report Table
      inquestReports: (fir.inquest_reports || []).map((ir: any) => ({
        id: ir.id,
        uidbNumber: ir.uidb_number
      })),

      // Accused Details mapping
      accused: (fir.accused || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        alias: a.alias,
        presentAddress: a.present_address,
        relativeName: a.relative_name
      })),

      // Properties mapping
      properties: (fir.properties || []).map((p: any) => ({
        id: p.id,
        value: p.value || 0,
        category: p.property_category,
        type: p.property_type,
        description: p.description
      })),

      status: fir.is_approved ? 'Approved' : 'Open', 
      priority: fir.priority || 'Medium', 
      pdf_url: fir.pdf_url,
      createdAt: fir.created_at,
      updatedAt: fir.updated_at,
    };

    return NextResponse.json(enrichedFir, { status: 200 });
  } catch (error) {
    console.error('Fetch FIR error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
