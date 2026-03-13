import os
import traceback
from dotenv import load_dotenv
from src.services.supabase_service import SupabaseFIRService
from src.generator.pdf_generator import FIRGenerator
from src.services.storage_service import SupabaseStorageService

load_dotenv()

def test_modular(fir_id):
    try:
        service = SupabaseFIRService()
        generator = FIRGenerator()
        storage = SupabaseStorageService()

        print("--- Step 1: Fetching Data ---")
        data = service.fetch_fir_data(fir_id)
        print("✅ Data Fetched Successfully")
        print(f"Report ID: {data.report.id}")

        print("--- Step 2: Generating PDF ---")
        output_path = f"test_{fir_id[:8]}.pdf"
        generator.generate_pdf(data, output_path)
        print(f"✅ PDF Generated: {output_path}")

        print("--- Step 3: Uploading to Storage ---")
        destination_name = f"TEST_FIR_{fir_id}.pdf"
        pdf_url = storage.upload_pdf(output_path, destination_name)
        print(f"✅ Upload Successful: {pdf_url}")

        print("--- Step 4: Updating DB ---")
        storage.update_fir_report_url(fir_id, pdf_url)
        print("✅ DB Updated")

    except Exception as e:
        print(f"❌ FAILED at some step: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    test_modular("56711eb3-f8a4-49a7-b87a-98640492b5e6")
