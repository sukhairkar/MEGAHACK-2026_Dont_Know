import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def check_fir_reports_columns():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    try:
        res = supabase.table("fir_reports").select("*").limit(1).execute()
        if res.data:
            columns = list(res.data[0].keys())
            print(f"COLUMNS:{columns}")
        else:
            print("No data in fir_reports")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_fir_reports_columns()
