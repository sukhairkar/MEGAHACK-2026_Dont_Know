import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def list_columns():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    
    tables = ["fir_reports", "complainants", "fir_sections", "accused", "properties", "complainant_ids", "inquest_reports"]
    
    for table in tables:
        try:
            # Fetch one row to see columns
            res = supabase.table(table).select("*").limit(1).execute()
            if res.data:
                print(f"Table: {table}")
                print(f"Columns: {list(res.data[0].keys())}")
            else:
                # If no data, try to fetch some info about the table or just note it's empty
                print(f"Table: {table} (Empty, cannot infer columns from data)")
        except Exception as e:
            print(f"Table {table} error: {e}")

if __name__ == "__main__":
    list_columns()
