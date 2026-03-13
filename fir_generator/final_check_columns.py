import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def final_check():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    tables = ["fir_reports", "complainants", "fir_sections", "accused", "properties", "complainant_ids", "inquest_reports"]
    
    for table in tables:
        try:
            res = supabase.table(table).select("*").limit(1).execute()
            if res.data:
                print(f"DEBUG_{table}: {list(res.data[0].keys())}")
            else:
                print(f"DEBUG_{table}: EMPTY")
        except Exception as e:
            print(f"DEBUG_{table}: ERROR - {e}")

if __name__ == "__main__":
    final_check()
