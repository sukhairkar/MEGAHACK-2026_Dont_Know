import os
from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client
from src.models.fir import FIRDataPayload, FIRReport, Complainant, FIRSection, Accused, Property, ComplainantIDDocument, InquestReport

# Load environment variables
load_dotenv()

class SupabaseFIRService:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        self.supabase: Client = create_client(url, key)

    def fetch_fir_data(self, fir_id: str) -> FIRDataPayload:
        """
        Fetches all data related to a specific FIR ID from Supabase
        and returns it as a validated FIRDataPayload.
        """
        clean_id = fir_id.strip()
        print(f"📡 Database Fetch: {clean_id}")
        
        # 1. Fetch Main Report
        report_res = self.supabase.table("fir_reports").select("*").eq("id", clean_id).execute()
        if not report_res.data:
            raise Exception(f"FIR Report with ID {clean_id} not found in database.")
        report_data = report_res.data[0]
        
        # 2. Fetch Complainant
        comp_res = self.supabase.table("complainants").select("*").eq("fir_id", clean_id).execute()
        complainant_data = comp_res.data[0] if comp_res.data else {}
        comp_id = complainant_data.get("id")

        # 3. Fetch Sections
        sections_res = self.supabase.table("fir_sections").select("*").eq("fir_id", clean_id).execute()
        sections_data = sections_res.data if sections_res.data else []

        # 4. Fetch Accused
        accused_res = self.supabase.table("accused").select("*").eq("fir_id", clean_id).execute()
        accused_data = accused_res.data if accused_res.data else []

        # 5. Fetch Properties
        prop_res = self.supabase.table("properties").select("*").eq("fir_id", clean_id).execute()
        properties_data = prop_res.data if prop_res.data else []

        # 6. Fetch Complainant IDs
        cids_data = []
        if comp_id:
            cids_res = self.supabase.table("complainant_ids").select("*").eq("complainant_id", comp_id).execute()
            cids_data = cids_res.data if cids_res.data else []

        # 7. Fetch Inquest Reports
        inquests_res = self.supabase.table("inquest_reports").select("*").eq("fir_id", clean_id).execute()
        inquests_data = inquests_res.data if inquests_res.data else []

        # Map to Pydantic Models with safe defaults
        from src.models.fir import ComplainantIDDocument, InquestReport
        return FIRDataPayload(
            report=FIRReport(**report_data),
            complainant=Complainant(**complainant_data),
            sections=[FIRSection(**s) for s in sections_data],
            accused_list=[Accused(**a) for a in accused_data],
            properties=[Property(**p) for p in properties_data],
            complainant_ids=[ComplainantIDDocument(id_type=c.get('id_type'), id_number=c.get('id_number')) for c in cids_data],
            inquest_reports=[InquestReport(uidb_number=i.get('uidb_number')) for i in inquests_data]
        )

    def save_sections(self, fir_id: str, sections: List[FIRSection]):
        """
        Saves a list of FIR sections to the database.
        """
        if not sections:
            return
        
        data_to_insert = [
            {"fir_id": fir_id, "act": s.act, "section": s.section}
            for s in sections
        ]
        
        print(f"💾 Saving {len(data_to_insert)} AI-suggested sections to database...")
        return self.supabase.table("fir_sections").insert(data_to_insert).execute()
