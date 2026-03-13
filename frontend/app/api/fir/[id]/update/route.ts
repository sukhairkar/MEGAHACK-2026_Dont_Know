import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { supabase } from '@/lib/supabase';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: firId } = await params;
    const body = await request.json();
    const { status, priority, notes, district, policeStation, year, firNumber } = body;

    const isApproved = status === 'Under Investigation' || status === 'Resolved';

    // 1. Update main FIR report
    const { data: updatedFir, error: updateError } = await supabase
      .from('fir_reports')
      .update({
        is_approved: isApproved,
        first_information_contents: notes !== undefined ? notes : undefined,
        district: district !== undefined ? district : undefined,
        police_station: policeStation !== undefined ? policeStation : undefined,
        year: year !== undefined ? (typeof year === 'string' ? parseInt(year) : year) : undefined,
        fir_no: firNumber !== undefined ? firNumber : undefined,
        
        info_type: body.infoType !== undefined ? body.infoType : undefined,
        occurrence_day: body.occurrenceDay !== undefined ? body.occurrenceDay : undefined,
        date_from: body.dateFrom !== undefined ? body.dateFrom : undefined,
        date_to: body.dateTo !== undefined ? body.dateTo : undefined,
        time_from: body.timeFrom !== undefined ? body.timeFrom : undefined,
        time_to: body.timeTo !== undefined ? body.timeTo : undefined,
        occurrence_address: body.occurrenceAddress !== undefined ? body.occurrenceAddress : undefined,
        direction_from_ps: body.directionFromPS !== undefined ? body.directionFromPS : undefined,
        distance_from_ps: body.distanceFromPS !== undefined ? body.distanceFromPS : undefined,
        beat_no: body.beatNo !== undefined ? body.beatNo : undefined,
        
        info_received_date: body.infoReceivedDate !== undefined ? body.infoReceivedDate : undefined,
        gd_entry_no: body.gdEntryNo !== undefined ? body.gdEntryNo : undefined,
        delay_reason: body.delayReason !== undefined ? body.delayReason : undefined,

        investigation_officer_name: body.investigationOfficerName,
        investigation_officer_rank: body.investigationOfficerRank,
        investigation_officer_number: body.investigationOfficerNumber,
        court_dispatch_datetime: body.courtDispatchDateTime
      })
      .eq('id', firId)
      .select()
      .single();

    if (updateError) {
      console.error('FIR update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Synchronize Sections (Clear and Insert)
    if (body.sections && Array.isArray(body.sections)) {
      await supabase.from('fir_sections').delete().eq('fir_id', firId);
      if (body.sections.length > 0) {
        const sectionsToInsert = body.sections.map((s: any) => ({
          fir_id: firId,
          act: s.act,
          section: s.section
        }));
        await supabase.from('fir_sections').insert(sectionsToInsert);
      }
    }

    // 3. Synchronize Accused (Clear and Insert)
    if (body.accused && Array.isArray(body.accused)) {
      await supabase.from('accused').delete().eq('fir_id', firId);
      if (body.accused.length > 0) {
        const accusedToInsert = body.accused.map((a: any) => ({
          fir_id: firId,
          name: a.name,
          alias: a.alias,
          present_address: a.presentAddress,
          relative_name: a.relativeName
        }));
        await supabase.from('accused').insert(accusedToInsert);
      }
    }

    // 4. Synchronize Properties (Clear and Insert)
    if (body.properties && Array.isArray(body.properties)) {
      await supabase.from('properties').delete().eq('fir_id', firId);
      if (body.properties.length > 0) {
        const propsToInsert = body.properties.map((p: any) => ({
          fir_id: firId,
          property_category: p.category,
          property_type: p.type,
          description: p.description,
          value: p.value || 0
        }));
        await supabase.from('properties').insert(propsToInsert);
      }
    }

    // 5. Synchronize Inquest Reports (Clear and Insert)
    if (body.inquestReports && Array.isArray(body.inquestReports)) {
      await supabase.from('inquest_reports').delete().eq('fir_id', firId);
      if (body.inquestReports.length > 0) {
        const inquestToInsert = body.inquestReports.map((ir: any) => ({
          fir_id: firId,
          uidb_number: ir.uidbNumber
        }));
        await supabase.from('inquest_reports').insert(inquestToInsert);
      }
    }

    // 6. Update Complainant
    if (body.complainantName) {
       const { data: compData, error: compErr } = await supabase.from('complainants').update({
         name: body.complainantName,
         relative_name: body.complainantRelativeName,
         birth_date: body.complainantBirthDate,
         nationality: body.complainantNationality,
         uid_number: body.complainantUidNumber,
         passport_number: body.complainantPassportNumber,
         passport_issue_date: body.complainantPassportIssueDate,
         passport_issue_place: body.complainantPassportIssuePlace,
         mobile: body.complainantMobile,
         occupation: body.complainantOccupation,
         current_address: body.complainantCurrentAddress,
         permanent_address: body.complainantPermanentAddress
       }).eq('fir_id', firId).select('id').single();

       // 6b. Synchronize Complainant IDs
       if (!compErr && compData && body.complainantIds && Array.isArray(body.complainantIds)) {
          await supabase.from('complainant_ids').delete().eq('complainant_id', compData.id);
          if (body.complainantIds.length > 0) {
             const cidsToInsert = body.complainantIds.map((cid: any) => ({
                complainant_id: compData.id,
                id_type: cid.idType,
                id_number: cid.idNumber
             }));
             await supabase.from('complainant_ids').insert(cidsToInsert);
          }
       }
    }

    // 6. Regenerate PDF
    try {
      console.log(`Starting PDF regeneration for FIR: ${firId}`);
      // Using absolute path to python and main.py
      const pythonPath = 'python'; // Assuming python is in PATH
      const scriptPath = 'c:\\Users\\supri\\Desktop\\JusticeRoute\\fir_generator\\main.py';
      const command = `${pythonPath} ${scriptPath} --fir_id ${firId}`;
      
      const { stdout, stderr } = await execAsync(command);
      console.log('PDF Gen Output:', stdout);
      if (stderr) console.error('PDF Gen Warning/Error:', stderr);
    } catch (genError) {
      console.error('Failed to trigger PDF generator:', genError);
      // We don't return 500 here because the database was updated successfully
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Case record and supporting files synchronized successfully' 
    });

  } catch (error) {
    console.error('Internal update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
