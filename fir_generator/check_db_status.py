
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def check_all():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase = create_client(url, key)
    
    fir_id = 'bdeebce7-e7b1-4ad1-af44-94dde66bb8db'
    
    print("--- DB RECORD ---")
    res = supabase.table("fir_reports").select("id, pdf_url, fir_no, police_station").eq("id", fir_id).execute()
    print(res.data[0] if res.data else "NOT FOUND")
    
    print("\n--- BUCKET FILES ---")
    bucket_files = supabase.storage.from_("fir_documents").list()
    if bucket_files:
        for f in bucket_files:
            if fir_id[:8] in f['name'] or 'FIR' in f['name']:
                print(f"- {f['name']}")
    else:
        print("BUCKET EMPTY OR ERROR")

    # Try a test update
    print("\n--- TEST UPDATE ---")
    test_update = supabase.table("fir_reports").update({"pdf_url": "https://test.com/pdf"}).eq("id", fir_id).execute()
    print("Update result data:", test_update.data)
    
if __name__ == "__main__":
    check_all()
