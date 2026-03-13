import os
import uuid
from datetime import datetime, date, time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def seed_gold_snatching():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)

    fir_id = str(uuid.uuid4())
    
    # 1. FIR Report
    report = {
        "id": fir_id,
        "district": "North Mumbai",
        "police_station": "Kandivali Police Station",
        "year": 2026,
        "fir_no": "KAN/2026/412",
        "fir_datetime": datetime.now().isoformat(),
        "occurrence_day": "Tuesday",
        "date_from": "2026-03-10",
        "time_from": "18:30:00",
        "info_received_date": "2026-03-10",
        "gd_entry_no": "GD-KAN-992/2026",
        "gd_datetime": datetime.now().isoformat(),
        "direction_from_ps": "West",
        "distance_from_ps": "2.2",
        "beat_no": "Beat 7",
        "occurrence_address": "Link Road, Near Mahavir Nagar, Kandivali West, Mumbai",
        "info_type": "Written",
        "delay_reason": "Complainant was in shock and had to visit the hospital for a minor neck injury caused by the snatching.",
        "total_property_value": 150000,
        "first_information_contents": "मी सुनिता शर्मा, वय ४२, राहणारी कांदिवली, आज संध्याकाळी ६:३० च्या सुमारास लिंक रोड, महावीर नगर जवळून चालत जात असताना, मागून एका काळ्या रंगाच्या पल्सर मोटारसायकलवरून दोन इसम आले. त्यांनी माझ्या गळ्यातील २५ ग्रॅम वजनाचे सोन्याचे मंगळसूत्र जोरात हिसकावले आणि वेगाने पळून गेले. आरोपींनी हेल्मेट घातलेले होते. या झटापटीत माझ्या मानेला थोडी इजा झाली आहे. कृपया गुन्हा दाखल करावा.",
        "investigation_officer_name": "S. K. Kadam",
        "investigation_officer_rank": "PSI",
        "investigation_officer_number": "PSI-8821"
    }
    
    supabase.table("fir_reports").insert(report).execute()
    print(f"✅ Created FIR Report: {fir_id}")

    # 2. Complainant
    complainant = {
        "fir_id": fir_id,
        "name": "Sunita Sharma",
        "relative_name": "Rajesh Sharma",
        "birth_date": "1984-05-15",
        "nationality": "Indian",
        "uid_number": "4422-xxxx-xxxx",
        "mobile": "9876543210",
        "current_address": "Flat 402, Garden View, Kandivali West, Mumbai",
        "permanent_address": "Same as current",
        "occupation": "Homemaker"
    }
    supabase.table("complainants").insert(complainant).execute()
    print("✅ Created Complainant")

    # 3. Sections
    sections = [
        {"fir_id": fir_id, "act": "IPC", "section": "379"},
        {"fir_id": fir_id, "act": "IPC", "section": "356"}
    ]
    supabase.table("fir_sections").insert(sections).execute()
    print("✅ Created Sections")

    # 4. Accused
    accused = [
        {
            "fir_id": fir_id, 
            "name": "Two Unknown Persons", 
            "alias": "Motorcycle snatchers", 
            "present_address": "On black pulsar bike, wore helmets"
        }
    ]
    supabase.table("accused").insert(accused).execute()
    print("✅ Created Accused")

    # 5. Property
    properties = [
        {
            "fir_id": fir_id,
            "property_category": "Jewellery",
            "property_type": "Gold Mangalsutra",
            "description": "25 Grams Gold Chain (Mangalsutra) with black beads",
            "value": 150000
        }
    ]
    supabase.table("properties").insert(properties).execute()
    print("✅ Created Properties")

    return fir_id

if __name__ == "__main__":
    new_id = seed_gold_snatching()
    print(f"FINAL_FIR_ID:{new_id}")
