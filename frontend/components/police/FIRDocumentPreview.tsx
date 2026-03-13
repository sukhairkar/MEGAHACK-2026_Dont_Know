
import React from 'react';
import { Landmark, Scale } from 'lucide-react';

interface FIRDocumentPreviewProps {
  data: any;
  isDraft?: boolean;
  onUpdate?: (field: string, value: string) => void;
  isEditable?: boolean;
}

export const FIRDocumentPreview: React.FC<FIRDocumentPreviewProps> = ({ 
  data, 
  isDraft = true, 
  onUpdate,
  isEditable = true 
}) => {
  if (!data) return null;

  const handleBlur = (field: string, e: React.FocusEvent<HTMLSpanElement | HTMLParagraphElement | HTMLDivElement>) => {
    if (onUpdate) {
      onUpdate(field, e.currentTarget.innerText);
    }
  };

  const Label = ({ en, mr }: { en: string; mr: string }) => (
    <span className="font-bold text-slate-900">{en} ({mr}): </span>
  );

  const EditableValue = ({ field, value, multiline = false }: { field: string, value: any, multiline?: boolean }) => (
    <span 
      contentEditable={isEditable}
      onBlur={(e) => handleBlur(field, e)}
      suppressContentEditableWarning
      className={`border-b border-dotted border-slate-400 min-w-[50px] inline-block px-1 focus:outline-none focus:bg-cyan-50 focus:border-cyan-500 transition-colors ${isEditable ? 'cursor-text hover:bg-slate-50' : ''} ${multiline ? 'block w-full min-h-[100px] border border-slate-900 p-2 mt-1 whitespace-pre-wrap' : ''}`}
    >
      {value || '__________'}
    </span>
  );

  return (
    <div className="bg-white shadow-2xl mx-auto w-full max-w-[800px] min-h-[1100px] p-10 text-slate-950 relative overflow-hidden border border-slate-300 leading-relaxed text-[13px]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;700&display=swap');
        .fir-doc-container * {
          font-family: 'Noto Sans Marathi', sans-serif !important;
        }
      `}</style>

      <div className="fir-doc-container">
        {/* Draft Watermark */}
        {isDraft && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] pointer-events-none opacity-[0.03] select-none z-0">
            <h1 className="text-[100px] font-black tracking-tighter uppercase whitespace-nowrap">
              DRAFT REPORT
            </h1>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center border-b-2 border-slate-900 pb-2 mb-4 relative z-10">
          <h1 className="text-[18px] font-bold uppercase m-0">महाराष्ट्र पोलीस / MAHARASHTRA POLICE</h1>
          <h2 className="text-[16px] font-bold m-0">प्रथम माहिती अहवाल (कलम १५४ फौ. प्र. सं. अन्वये)</h2>
          <h3 className="text-[14px] font-bold m-0">FIRST INFORMATION REPORT (u/s 154 Cr.P.C.)</h3>
        </div>

        {/* 1. Basic Details */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">1. Basic Details (मूलभूत तपशील)</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label en="District" mr="जिल्हा" />
            <EditableValue field="district" value={data.district} />
          </div>
          <div>
            <Label en="FIR No." mr="प्रथम खबर क्र." />
            <EditableValue field="firNumber" value={data.firNumber} />
          </div>
          <div>
            <Label en="Date and Time of FIR" mr="प्र. ख. दिनांक व वेळ" />
            <span className="px-1 border-b border-dotted border-slate-400">
              {data.firDateTime ? new Date(data.firDateTime).toLocaleString() : '__________'}
            </span>
          </div>
          <div>
            <Label en="Police Station" mr="ठाणे" />
            <EditableValue field="policeStation" value={data.policeStation} />
          </div>
          <div>
            <Label en="Year" mr="वर्ष" />
            <EditableValue field="year" value={data.year} />
          </div>
        </div>

        {/* 2. Sections */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">2. Sections (कलम)</div>
        <table className="w-full border-collapse border border-slate-900 mb-4 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="border border-slate-900 p-1 text-left w-12">S.No</th>
              <th className="border border-slate-900 p-1 text-left">Act (अधिनियम/कायदा)</th>
              <th className="border border-slate-900 p-1 text-left">Section (कलम)</th>
            </tr>
          </thead>
          <tbody>
            {(data.sections && data.sections.length > 0) ? data.sections.map((s: any, i: number) => (
              <tr key={s.id || i}>
                <td className="border border-slate-900 p-1">{i + 1}</td>
                <td className="border border-slate-900 p-1">{s.act}</td>
                <td className="border border-slate-900 p-1 font-bold">{s.section}</td>
              </tr>
            )) : (
              <tr>
                <td className="border border-slate-900 p-1">1</td>
                <td className="border border-slate-900 p-1 text-slate-300">__________</td>
                <td className="border border-slate-900 p-1 text-slate-300">__________</td>
              </tr>
            )}
          </tbody>
        </table>

      {/* 3. Occurrence - Expanded */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">3. Occurrence of Offence (गुन्ह्याची घटना)</div>
      <div className="mb-4 space-y-2 px-2">
        <div>(a) <Label en="Day" mr="दिवस" /> <EditableValue field="occurrenceDay" value={data.occurrenceDay} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label en="Date From" mr="दिनांक पासून" /> <EditableValue field="dateFrom" value={data.dateFrom} /></div>
          <div><Label en="Date To" mr="दिनांक पर्यंत" /> <EditableValue field="dateTo" value={data.dateTo} /></div>
          <div><Label en="Time From" mr="वेळेपासून" /> <EditableValue field="timeFrom" value={data.timeFrom} /></div>
          <div><Label en="Time To" mr="वेळेपर्यंत" /> <EditableValue field="timeTo" value={data.timeTo} /></div>
        </div>
        <div className="mt-2">
          (b) <Label en="Information Received at Police Station" mr="पोलीस ठाण्यात माहिती मिळाल्याचा दिनांक" />
          <EditableValue field="infoReceivedDate" value={data.infoReceivedDate} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>(c) <Label en="GD Entry No." mr="नोंद क्र." /> <EditableValue field="gdEntryNo" value={data.gdEntryNo} /></div>
           <div><Label en="GD Date & Time" mr="दिनांक व वेळ" /> <span className="border-b border-dotted border-slate-400">{data.gdDateTime ? new Date(data.gdDateTime).toLocaleString() : '__________'}</span></div>
        </div>
      </div>

      {/* 4. Type of Info */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">4. Type of Information (माहितीचा प्रकार)</div>
      <div className="px-2 mb-4"><EditableValue field="infoType" value={data.infoType} /></div>

      {/* 5. Place of Occurrence */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">5. Place of Occurrence (घटनास्थळ)</div>
      <div className="mb-4 space-y-2 px-2">
        <div>(a) Direction and distance from PS: <EditableValue field="directionFromPS" value={data.directionFromPS} /> (<EditableValue field="distanceFromPS" value={data.distanceFromPS} /> KM)</div>
        <div><Label en="Beat No." mr="बिट क्र." /> <EditableValue field="beatNo" value={data.beatNo} /></div>
        <div>(b) <Label en="Address" mr="पत्ता" /> <EditableValue field="occurrenceAddress" value={data.occurrenceAddress} /></div>
        <div>(c) <Label en="If outside jurisdiction, PS Name" mr="बाहेर असल्यास, ठाण्याचे नाव" /> <EditableValue field="outsidePSName" value={data.outsidePSName} /></div>
      </div>

      {/* 6. Complainant */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">6. Complainant Details (तक्रारदार)</div>
      <div className="mb-2 grid grid-cols-2 gap-x-8 gap-y-1 px-2">
        <div className="col-span-2">(a) <Label en="Name" mr="नाव" /> <EditableValue field="complainantName" value={data.complainantName} /></div>
        <div>(b) <Label en="Father's/Husband's Name" mr="वडील / पतीचे नाव" /> <EditableValue field="complainantRelativeName" value={data.complainantRelativeName} /></div>
        <div>(c) <Label en="Birth Date" mr="जन्म तारीख" /> <EditableValue field="complainantBirthDate" value={data.complainantBirthDate} /></div>
        <div>(d) <Label en="Nationality" mr="राष्ट्रीयत्व" /> <EditableValue field="complainantNationality" value={data.complainantNationality} /></div>
        <div>(j) <Label en="Mobile No." mr="भ्रमणध्वनी क्र." /> <EditableValue field="complainantMobile" value={data.complainantMobile} /></div>
        <div className="col-span-2">(e) <Label en="UID / Aadhaar No." mr="युआयडी / आधार क्र." /> <EditableValue field="complainantUidNumber" value={data.complainantUidNumber} /></div>
      </div>

      <div className="mb-2 px-2 grid grid-cols-3 gap-2">
         <div>(f) <Label en="Passport No" mr="पारपत्र क्र." /> <EditableValue field="complainantPassportNumber" value={data.complainantPassportNumber} /></div>
         <div><Label en="Issue Date" mr="देण्यात आल्याची तारीख" /> <EditableValue field="complainantPassportIssueDate" value={data.complainantPassportIssueDate} /></div>
         <div><Label en="Place" mr="ठिकाण" /> <EditableValue field="complainantPassportIssuePlace" value={data.complainantPassportIssuePlace} /></div>
      </div>

      <div className="mb-2 px-2">
         <div>(g) <Label en="Occupation" mr="व्यवसाय" /> <EditableValue field="complainantOccupation" value={data.complainantOccupation} /></div>
         <div>(h) <Label en="Current Address" mr="सध्याचा पत्ता" /> <EditableValue field="complainantCurrentAddress" value={data.complainantCurrentAddress} /></div>
         <div>(i) <Label en="Permanent Address" mr="कायमी पत्ता" /> <EditableValue field="complainantPermanentAddress" value={data.complainantPermanentAddress} /></div>
      </div>

      {data.complainantIds && data.complainantIds.length > 0 && (
        <div className="px-2 mb-4">
          <table className="w-full border-collapse border border-slate-900 text-[11px]">
             <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-900 p-1">S.No</th>
                  <th className="border border-slate-900 p-1">ID Type (ओळखपत्राचा प्रकार)</th>
                  <th className="border border-slate-900 p-1">ID Number (ओळखपत्र क्र.)</th>
                </tr>
             </thead>
             <tbody>
                {data.complainantIds.map((cid: any, i: number) => (
                  <tr key={i}>
                    <td className="border border-slate-900 p-1 text-center">{i+1}</td>
                    <td className="border border-slate-900 p-1">{cid.idType}</td>
                    <td className="border border-slate-900 p-1 font-bold">{cid.idNumber}</td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      )}

      {/* 7. Accused Details */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">7. Details of Known/Suspected/Unknown Accused (माहित असलेले / संशयित / अनोळखी आरोपीचा संपूर्ण पत्ता)</div>
      <table className="w-full border-collapse border border-slate-900 mb-4 text-xs font-marathi">
        <thead className="bg-slate-50">
          <tr>
            <th className="border border-slate-900 p-1 w-10">S.No</th>
            <th className="border border-slate-900 p-1">Name (नाव)</th>
            <th className="border border-slate-900 p-1">Address (पत्ता)</th>
          </tr>
        </thead>
        <tbody>
          {(data.accused && data.accused.length > 0) ? data.accused.map((a: any, i: number) => (
            <tr key={a.id || i}>
              <td className="border border-slate-900 p-1 text-center">{i + 1}</td>
              <td className="border border-slate-900 p-1">{a.name} {a.alias ? `(${a.alias})` : ''}</td>
              <td className="border border-slate-900 p-1">{a.presentAddress || 'N/A'}</td>
            </tr>
          )) : (
            <tr><td className="border border-slate-900 p-1 text-center">1</td><td className="border border-slate-900 p-1 text-slate-300">__________</td><td className="border border-slate-900 p-1 text-slate-300">__________</td></tr>
          )}
        </tbody>
      </table>

      {/* 8. Delay */}
      <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">8. Reasons for Delay (विलंबाचे कारण)</div>
      <div className="px-2 mb-4 italic text-slate-600">{data.delayReason || 'No delay reported.'}</div>

        {/* 9. Property */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">9. Property Details (मालमत्तेचा तपशील)</div>
        <table className="w-full border-collapse border border-slate-900 mb-2 text-[11px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-900 p-1">S.No</th>
              <th className="border border-slate-900 p-1">Category (वर्गवारी)</th>
              <th className="border border-slate-900 p-1">Type (प्रकार)</th>
              <th className="border border-slate-900 p-1">Value (किंमत - रु.)</th>
            </tr>
          </thead>
          <tbody>
            {(data.properties && data.properties.length > 0) ? data.properties.map((p: any, i: number) => (
              <tr key={p.id}>
                <td className="border border-slate-900 p-1">{i + 1}</td>
                <td className="border border-slate-900 p-1">{p.category}</td>
                <td className="border border-slate-900 p-1">{p.type}</td>
                <td className="border border-slate-900 p-1 text-right">{p.value?.toLocaleString()}</td>
              </tr>
            )) : (
              <tr><td className="border border-slate-900 p-1">1</td><td className="border border-slate-900 p-1 text-slate-300">__________</td><td className="border border-slate-900 p-1 text-slate-300">__________</td><td className="border border-slate-900 p-1 text-slate-300">__________</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-2 mb-4">
          10. <Label en="Total Value" mr="एकूण किंमत" /> 
          <span className="font-bold ml-2">₹{(data.properties?.reduce((acc: number, p: any) => acc + (p.value || 0), 0) || 0).toLocaleString()}</span>
        </div>

        {/* 11. Inquest Reports */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">11. Inquest / U.I.D.B. Case Details (इन्क्वेस्ट अहवाल / यू.आय.डी.बी. गुन्ह्याचा तपशील)</div>
        <div className="px-2 mb-4">
          {data.inquestReports && data.inquestReports.length > 0 ? (
             <ul className="list-disc list-inside">
                {data.inquestReports.map((ir: any, i: number) => (
                   <li key={i} className="font-bold">Case No: {ir.uidbNumber}</li>
                ))}
             </ul>
          ) : (
             <p className="italic text-slate-500">No Inquest / UIDB cases linked.</p>
          )}
        </div>

        {/* 12. Contents */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">12. First Information Contents (प्रथम खबर हकीकत)</div>
        <div 
          contentEditable={isEditable}
          onBlur={(e) => handleBlur('firstInformationContents', e)}
          suppressContentEditableWarning
          className={`border border-slate-900 p-4 min-h-[200px] mb-8 font-serif italic text-base leading-relaxed whitespace-pre-wrap focus:outline-none focus:bg-cyan-50 focus:border-cyan-500 ${isEditable ? 'cursor-text' : ''}`}
        >
          {data.firstInformationContents || data.notes || "No content provided."}
        </div>

        {/* 13. Action Taken */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">13. Action Taken (केलेली कारवाई)</div>
        <div className="px-2 mb-4 space-y-2">
          <p>The above report reveals commission of offence(s) u/s as mentioned at Item No. 2.</p>
          <div className="grid grid-cols-2 gap-4">
             <div><Label en="Investigating Officer" mr="तपास अधिकारी" /> {data.investigationOfficerName || '__________'}</div>
             <div><Label en="Rank" mr="पदनाम" /> {data.investigationOfficerRank || '__________'}</div>
             <div><Label en="Number" mr="क्र." /> {data.investigationOfficerNumber || '__________'}</div>
          </div>
        </div>

        {/* 15. Court Dispatch */}
        <div className="bg-slate-100 px-3 py-1 font-bold border border-slate-900 mb-2">15. Date and Time of Dispatch to the Court</div>
        <div className="px-2 mb-8 italic">
          {data.courtDispatchDateTime ? new Date(data.courtDispatchDateTime).toLocaleString() : 'Not dispatched yet.'}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-2 gap-10 mt-10">
          <div className="text-center pt-8 border-t-0">
            <p className="font-bold border-t border-slate-900 pt-1">14. Signature of Complainant</p>
            <p className="text-[10px]">(फिर्यादीची सही / अंगठा)</p>
          </div>
          <div className="text-center pt-8 border-t-0">
            <p className="font-bold border-t border-slate-900 pt-1">Signature of Officer in Charge</p>
            <p className="font-bold text-xs uppercase">{data.policeStation}</p>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
          <Landmark className="w-48 h-48" />
        </div>
      </div>
    </div>
  );
};
