import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def check_tables():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    tables_to_check = [
        "fir_reports", "complainants", "fir_sections", "accused", "properties",
        "complainant_ids", "inquest_reports", "fir_complainant_ids", "fir_inquest_reports",
        "fir_accused", "fir_properties"
    ]
    
    results = {}
    for table in tables_to_check:
        try:
            supabase.table(table).select("count", count="exact").limit(1).execute()
            results[table] = "EXISTS"
        except Exception as e:
            results[table] = f"MISSING ({str(e).splitlines()[0]})"
            
    for table, status in results.items():
        print(f"{table}: {status}")

if __name__ == "__main__":
    check_tables()
