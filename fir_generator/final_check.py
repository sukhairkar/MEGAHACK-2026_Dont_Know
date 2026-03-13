
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def check_db():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase = create_client(url, key)
    
    fir_id = 'bdeebce7-e7b1-4ad1-af44-94dde66bb8db'
    res = supabase.table("fir_reports").select("id, pdf_url, fir_no, police_station").eq("id", fir_id).execute()
    
    if res.data:
        print("DATABASE RECORD:")
        print(res.data[0])
    else:
        print("RECORD NOT FOUND")

if __name__ == "__main__":
    check_db()
