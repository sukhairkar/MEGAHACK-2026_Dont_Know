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
            "fir_no": f"{datetime.now().strftime('%d/%m/%Y %H:%M')}",
            "fir_datetime": datetime.now().isoformat(),
            "occurrence_address": incident_place,
            "first_information_contents": f"{incident_place} जवळ माझी बॅग हिसकावून नेण्यात आली आहे. बॅगमध्ये माझे महत्त्वाचे कागदपत्रे आणि रोख रक्कम होती.",
            "info_type": "Written",
            "occurrence_day": "Friday",
            "direction_from_ps": "South-West",
            "distance_from_ps": "2",
            "beat_no": "Beat 4",
            "delay_reason": "Complainant was in shock.",
            "total_property_value": 5000,
            "investigation_officer_name": "S. I. Sharma",
            "investigation_officer_rank": "Sub-Inspector",
            "investigation_officer_number": "PN-12345",
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
            "name": "विजय चव्हाण",
            "current_address": "वरळी, मुंबई - ४०००१८",
            "occupation": "व्यावसायिक",
            "mobile": "9123456789"
        }
        res = supabase.table("complainants").insert(complainant).execute()
        if hasattr(res, 'error') and res.error: print(f"Error: {res.error}")

        # 3. Insert Sections
        sections = [
            {"fir_id": fir_id, "act": "IPC", "section": "392"},
            {"fir_id": fir_id, "act": "IPC", "section": "34"}
        ]
        res = supabase.table("fir_sections").insert(sections).execute()
        if hasattr(res, 'error') and res.error: print(f"Error: {res.error}")

        # 4. Insert Accused
        accused = {
            "fir_id": fir_id,
            "name": "अज्ञात व्यक्ती",
            "alias": "काळ्या जॅकेटवाला"
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
