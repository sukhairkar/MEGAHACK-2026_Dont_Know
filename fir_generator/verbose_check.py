import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def verbose_check():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    fir_id = "56711eb3-f8a4-49a7-b87a-98640492b5e6"
    
    print(f"Testing fetch for fir_id: {fir_id}")
    
    try:
        print("1. Testing complainants...")
        res = supabase.table("complainants").select("*").eq("fir_id", fir_id).execute()
        print(f"   Count: {len(res.data)}")
        
        print("2. Testing fir_sections...")
        res = supabase.table("fir_sections").select("*").eq("fir_id", fir_id).execute()
        print(f"   Count: {len(res.data)}")
        
        print("3. Testing accused...")
        res = supabase.table("accused").select("*").eq("fir_id", fir_id).execute()
        print(f"   Count: {len(res.data)}")
        
        print("4. Testing properties...")
        res = supabase.table("properties").select("*").eq("fir_id", fir_id).execute()
        print(f"   Count: {len(res.data)}")
        
        print("5. Testing complainant_ids...")
        res = supabase.table("complainant_ids").select("*").eq("fir_id", fir_id).execute()
        print(f"   Count: {len(res.data)}")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        if hasattr(e, 'message'): print(f"Message: {e.message}")
        if hasattr(e, 'code'): print(f"Code: {e.code}")
        if hasattr(e, 'hint'): print(f"Hint: {e.hint}")
        if hasattr(e, 'details'): print(f"Details: {e.details}")

if __name__ == "__main__":
    verbose_check()
