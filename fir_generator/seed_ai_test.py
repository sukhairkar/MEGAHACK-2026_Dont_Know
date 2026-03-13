import os
import uuid
import requests
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def seed_ai_test():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)

    fir_id = str(uuid.uuid4())
    
    # Incident data with context for AI
    report_data = {
        "id": fir_id,
        "district": "Palghar",
        "police_station": "Vasai Road",
        "year": 2026,
        "fir_no": f"AI/TEST/{datetime.now().strftime('%M%S')}",
        "fir_datetime": datetime.now().isoformat(),
        "occurrence_address": "Vasai West Merces Beach",
        "date_from": "2026-03-14",
        "time_from": "11:00:00",
        "info_type": "Written",
        "description": "My high-end camera was stolen while I was taking photos of the sunset at Merces Beach. A person on a bike snatched it from my neck.",
        "witnesses": "Anil Mehta (Lifeguard)",
        "evidence": "CCTV footage from nearby shack",
        "first_information_contents": "" # LEAVE EMPTY TO TRIGGER AI
    }

    try:
        supabase.table("fir_reports").insert(report_data).execute()
        print(f"✅ Created FIR Report: {fir_id}")
    except Exception as e:
        if "PGRST204" in str(e) or "column" in str(e).lower():
            print("⚠️ Some AI columns missing in Supabase. Cleaning up and retrying fallback...")
            # Fallback: remove AI-only columns if schema isn't updated yet
            fallback_report = {k: v for k, v in report_data.items() if k not in ["witnesses", "evidence", "description"]}
            supabase.table("fir_reports").insert(fallback_report).execute()
            print(f"✅ Created Base FIR Report (Fallback): {fir_id}")
        else:
            print(f"❌ Error seeding FIR: {e}")
            return None

    # 2. Complainant
    comp_data = {
        "fir_id": fir_id,
        "name": "Sukhvinder Singh",
        "mobile": "9988776655",
        "current_address": "Andheri West, Mumbai",
        "age": 28
    }

    try:
        supabase.table("complainants").insert(comp_data).execute()
    except Exception as e:
        if "column" in str(e).lower():
            fallback_comp = {k: v for k, v in comp_data.items() if k != "age"}
            supabase.table("complainants").insert(fallback_comp).execute()
            print("✅ Created Complainant (Age skipped)")
        else:
            print(f"❌ Error seeding complainant: {e}")

    return fir_id

if __name__ == "__main__":
    fid = seed_ai_test()
    if fid:
        print(f"\n🚀 SEED SUCCESS! Now run:")
        print(f"   python main.py --fir_id {fid}")
