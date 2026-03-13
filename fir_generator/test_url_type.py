
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def test_url():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase = create_client(url, key)
    
    res = supabase.storage.from_("fir_documents").get_public_url("test.pdf")
    print(f"Type: {type(res)}")
    print(f"Value: {res}")

if __name__ == "__main__":
    test_url()
