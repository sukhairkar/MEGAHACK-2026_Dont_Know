import os
import uuid
from datetime import datetime, date
from dotenv import load_dotenv
from supabase import create_client, Client
from src.services.location_service import LocationService

# Load credentials
load_dotenv()

def seed_sample_data():
    url: str = os.getenv("SUPABASE_URL")
    key: str = os.getenv("SUPABASE_KEY")
    
    if not url or not key or "your_" in url:
        print("❌ Error: Please update your .env file with real Supabase credentials first!")
        return

    supabase: Client = create_client(url, key)
    
    # Generate a unique ID for this test FIR
    fir_id = str(uuid.uuid4())

    # Automatically detect location based on incident place
    incident_place = "Palghar"
    loc_results = LocationService.detect_location(address=incident_place)
    
    juris = loc_results.get("jurisdiction")
    city = juris.get("district")
    ps_name = juris.get("police_station")
    filling_loc = loc_results.get("filling_location")
    
    print(f"📍 Jurisdiction (from Incident): {ps_name}, {city}")
    print(f"🕵️ Audit (Filling Location): {filling_loc}")
    
    print(f"🚀 Seeding sample FIR data (ID: {fir_id})...")

    try:
        # 1. Insert FIR Report
        report = {
            "id": fir_id,
            "district": city,
            "police_station": ps_name,
            "filling_location": filling_loc,
            "year": datetime.now().year,
            "fir_no": f"AI_TEST_{datetime.now().strftime('%d_%m_%H%M')}",
            "fir_datetime": datetime.now().isoformat(),
            "occurrence_address": incident_place,
            "first_information_contents": f"My parked car, a silver Honda City (MH-04-AB-1234), was stolen from outside {incident_place} supermarket. I had parked it there around 8 PM and when I returned at 9:30 PM, it was missing.",
            "info_type": "Written",
            "occurrence_day": "Tuesday",
            "direction_from_ps": "North",
            "distance_from_ps": "5",
            "beat_no": "Beat 2",
            "delay_reason": "Searching the nearby area before reporting.",
            "total_property_value": 850000,
            "investigation_officer_name": "Insp. R. K. Patil",
            "investigation_officer_rank": "Inspector",
            "investigation_officer_number": "MH-98765",
            "is_approved": False
        }
        try:
            res = supabase.table("fir_reports").insert(report).execute()
        except Exception as e:
            # If the column is missing (PGRST204), retry without filling_location
            if 'filling_location' in str(e):
                print("⚠️  'filling_location' column not found in database. Seeding without audit trail...")
                report.pop('filling_location')
                res = supabase.table("fir_reports").insert(report).execute()
            else:
                raise e
        
        # 2. Insert Complainant
        complainant = {
            "fir_id": fir_id,
            "name": "Amit Sharma",
            "current_address": "Andheri West, Mumbai - 400053",
            "occupation": "Software Engineer",
            "mobile": "9876543210"
        }
        res = supabase.table("complainants").insert(complainant).execute()
        if hasattr(res, 'error') and res.error: print(f"Error: {res.error}")

        # 3. Insert Sections (Commented out to test AI suggestion)
        # sections = [
        #     {"fir_id": fir_id, "act": "IPC", "section": "392"},
        #     {"fir_id": fir_id, "act": "IPC", "section": "34"}
        # ]
        # res = supabase.table("fir_sections").insert(sections).execute()
        # if hasattr(res, 'error') and res.error: print(f"Error: {res.error}")

        # 4. Insert Accused
        accused = {
            "fir_id": fir_id,
            "name": "Unknown Person",
            "alias": "Wearing Black Jacket"
        }
        res = supabase.table("accused").insert(accused).execute()
        if hasattr(res, 'error') and res.error: print(f"Error: {res.error}")

        print("\n✅ Seed successful!")
        print(f"👉 Now run this command to generate the PDF:")
        print(f"   python main.py --fir_id {fir_id}")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        print("\n💡 Tip: Make sure your 'fir_reports' table has a 'filling_location' column (TEXT).")
        print("   (Ensure your Supabase tables match the schema you provided earlier)")

if __name__ == "__main__":
    seed_sample_data()
