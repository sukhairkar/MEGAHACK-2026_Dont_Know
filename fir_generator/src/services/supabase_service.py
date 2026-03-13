import os
from dotenv import load_dotenv
from supabase import create_client, Client
from src.models.fir import FIRDataPayload, FIRReport, Complainant, FIRSection, Accused, Property

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
        # 1. Fetch Main Report
        report_res = self.supabase.table("fir_reports").select("*").eq("id", fir_id).execute()
        
        if not report_res.data:
            raise Exception(f"FIR Report with ID {fir_id} not found.")
        
        report_data = report_res.data[0]
        
        # 2. Fetch Complainant
        comp_res = self.supabase.table("complainants").select("*").eq("fir_id", fir_id).single().execute()
        complainant_data = comp_res.data if comp_res.data else {}

        # 3. Fetch Sections
        sections_res = self.supabase.table("fir_sections").select("*").eq("fir_id", fir_id).execute()
        sections_data = sections_res.data if sections_res.data else []

        # 4. Fetch Accused
        accused_res = self.supabase.table("accused").select("*").eq("fir_id", fir_id).execute()
        accused_data = accused_res.data if accused_res.data else []

        # 5. Fetch Properties
        prop_res = self.supabase.table("properties").select("*").eq("fir_id", fir_id).execute()
        properties_data = prop_res.data if prop_res.data else []

        # Map to Pydantic Models
        return FIRDataPayload(
            report=FIRReport(**report_data),
            complainant=Complainant(**complainant_data),
            sections=[FIRSection(**s) for s in sections_data],
            accused_list=[Accused(**a) for a in accused_data],
            properties=[Property(**p) for p in properties_data]
        )
