import os
import argparse
from datetime import datetime
from src.generator.pdf_generator import FIRGenerator
from src.services.supabase_service import SupabaseFIRService
from src.services.storage_service import SupabaseStorageService

def generate_fir_by_id(fir_id: str, output_path: str = None):
    """
    Complete backend logic: 
    1. Fetch from Supabase -> 2. Validate -> 3. Render HTML -> 4. Export PDF -> 5. Upload to Storage
    """
    service = SupabaseFIRService()
    generator = FIRGenerator()
    storage = SupabaseStorageService()
    
    print(f"📡 Fetching data for FIR ID: {fir_id}...")
    try:
        data = service.fetch_fir_data(fir_id)
        
        # Generation
        is_temporary = False
        if output_path is None:
            is_temporary = True
            fir_safe = data.report.fir_no.replace('/', '_').replace(':', '-')
            output_path = f"temp_{fir_safe}.pdf"
            
        generator.generate_pdf(data, output_path)
        
        # 5. Upload to Supabase Storage
        print(f"☁️ Uploading to Supabase Storage...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        destination_name = f"FIR_{data.report.fir_no.replace('/', '_').replace(':', '-')}_{timestamp}.pdf"
        
        pdf_url = storage.upload_pdf(output_path, destination_name)
        print(f"🔗 Public URL: {pdf_url}")

        # 6. Update DB with URL
        storage.update_fir_report_url(fir_id, pdf_url)
        print(f"✅ Success! Database updated with document link.")

        # 7. Cleanup local temporary file
        if is_temporary and os.path.exists(output_path):
            os.remove(output_path)
            print(f"🧹 Local temporary file removed.")
        
        return pdf_url
        
    except Exception as e:
        print(f"❌ Error during backend processing: {e}")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Maharashtra FIR PDF Generator")
    parser.add_argument("--fir_id", help="The UUID of the FIR report in Supabase")
    parser.add_argument("--out", help="Output PDF path")
    
    args = parser.parse_args()
    
    if args.fir_id:
        generate_fir_by_id(args.fir_id, args.out)
    else:
        print("💡 Usage: python main.py --fir_id <UUID>")
        print("   (Ensure your .env is configured with SUPABASE_URL and SUPABASE_KEY)")
