import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseStorageService:
    def __init__(self):
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_KEY")
        self.supabase: Client = create_client(url, key)
        self.bucket_name = "fir_documents"

    def upload_pdf(self, file_path: str, destination_name: str) -> str:
        """
        Uploads a local PDF to Supabase Storage and returns the public URL.
        """
        with open(file_path, 'rb') as f:
            file_data = f.read()
            
        # Upload to bucket
        self.supabase.storage.from_(self.bucket_name).upload(
            path=destination_name,
            file=file_data,
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
        
        # Get Public URL
        # Note: Ensure the bucket is set to 'Public' in Supabase dashboard
        res = self.supabase.storage.from_(self.bucket_name).get_public_url(destination_name)
        return res

    def update_fir_report_url(self, fir_id: str, pdf_url: str):
        """
        Updates the fir_reports table with the persistent PDF link.
        """
        self.supabase.table("fir_reports").update({"pdf_url": pdf_url}).eq("id", fir_id).execute()
