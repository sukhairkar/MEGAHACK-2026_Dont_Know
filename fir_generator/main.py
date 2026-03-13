import os
import argparse
from datetime import datetime
from src.generator.pdf_generator import FIRGenerator
from src.services.supabase_service import SupabaseFIRService
from src.services.storage_service import SupabaseStorageService
from src.ipc_suggestion.suggester import IPCSuggester
from src.models.fir import FIRSection
from statement.generator import generate_statement

def generate_fir_by_id(fir_id: str, output_path: str = None):
    """
    Complete backend logic: 
    1. Fetch from Supabase -> 2. Enhance with AI Statement -> 3. Render HTML -> 4. Export PDF -> 5. Upload to Storage
    """
    service = SupabaseFIRService()
    generator = FIRGenerator()
    storage = SupabaseStorageService()
    
    print(f"📡 Fetching data for FIR ID: {fir_id}...")
    try:
        data = service.fetch_fir_data(fir_id)
        
        # AI Statement Generation
        # Trigger if contents are missing, empty, or too short (less than ~150 words)
        current_contents = data.report.first_information_contents or ""
        word_count = len(current_contents.split())
        
        if not current_contents.strip() or word_count < 150:
            print(f"🤖 Generating/Expanding AI Statement (Current length: {word_count} words)...")
            # Gather property details if any
            property_details = "None provided"
            if data.properties:
                property_details = "; ".join([f"{p.property_type}: {p.description} (Value: {p.value})" for p in data.properties])

            ai_input = {
                "name": data.complainant.name,
                "age": data.complainant.age or "____________",
                "address": data.complainant.current_address or "____________",
                "date": data.report.date_from.strftime('%d/%m/%Y') if data.report.date_from else "____________",
                "time": data.report.time_from.strftime('%H:%M') if data.report.time_from else "____________",
                "location": data.report.occurrence_address or "____________",
                "description": current_contents if current_contents.strip() else (data.report.description or "No description provided"),
                "suspect": ", ".join([a.name for a in data.accused_list]) if data.accused_list else "Unknown",
                "witness": data.report.witnesses or "None mentioned",
                "evidence": data.report.evidence or "None provided",
                "property_details": property_details
            }
            # Generate in English (en) as per user preference
            ai_narrative = generate_statement(ai_input, lang="en")
            data.report.first_information_contents = ai_narrative
            print("✅ AI Statement expanded successfully.")

        # AI Legal Section Suggestion (Section 2)
        # Suggest if sections are missing
        if not data.sections or len(data.sections) == 0:
            print("⚖️ Analyzing narrative for AI Legal Section Suggestions (Section 2)...")
            try:
                # Use the narrative (either existing or just generated)
                narrative_to_analyze = data.report.first_information_contents
                if narrative_to_analyze and narrative_to_analyze.strip():
                    suggester = IPCSuggester()
                    suggestions = suggester.suggest(narrative_to_analyze, top_k=3)
                    
                    if suggestions:
                        print(f"✅ Found {len(suggestions)} legal suggestions:")
                        new_sections = []
                        for s in suggestions:
                            print(f"   - {s['section']}: {s['title']}")
                            new_sections.append(FIRSection(act="IPC", section=s['section']))
                        
                        data.sections = new_sections
                        print("📝 Section 2 auto-populated with AI suggestions.")
                        # Persist back to DB
                        service.save_sections(fir_id, new_sections)
                else:
                    print("⚠️ No narrative found to analyze for legal sections.")
            except Exception as e:
                print(f"⚠️ AI Legal Suggestion failed: {e}")
        is_temporary = False
        if output_path is None:
            is_temporary = True
            fir_safe = data.report.fir_no.replace('/', '_').replace(':', '-')
            output_path = f"temp_{fir_safe}.pdf"
            
        generator.generate_pdf(data, output_path)
        
        # 5. Upload to Supabase Storage
        print(f"☁️ Uploading to Supabase Storage...")
        # Use a static filename per FIR ID to allow overwriting/upsert
        destination_name = f"FIR_OFFICIAL_{fir_id}.pdf"
        
        pdf_url = storage.upload_pdf(output_path, destination_name)
        print(f"🔗 Public URL: {pdf_url}")

        # 6. Update DB with URL
        storage.update_fir_report_url(fir_id, pdf_url)
        print(f"✅ Success! Database updated with document link.")

        # 7. Cleanup local temporary file
        if is_temporary and os.path.exists(output_path):
            os.remove(output_path)
            print(f"🧹 Local temporary file removed.")
        
        return pdf_url
        
    except Exception as e:
        import traceback
        print(f"❌ Error during backend processing: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Maharashtra FIR PDF Generator")
    parser.add_argument("--fir_id", help="The UUID of the FIR report in Supabase")
    parser.add_argument("--latest", action="store_true", help="Use the most recently created FIR record")
    parser.add_argument("--out", help="Output PDF path")
    
    args = parser.parse_args()
    
    active_id = args.fir_id
    if args.latest:
        print("🔍 Searching for the most recent FIR record...")
        try:
            service = SupabaseFIRService()
            res = service.supabase.table("fir_reports").select("id").order("created_at", desc=True).limit(1).execute()
            if res.data:
                active_id = res.data[0]['id']
                print(f"✅ Found latest ID: {active_id}")
            else:
                print("❌ No FIR records found in database.")
                active_id = None
        except Exception as e:
            print(f"❌ Error fetching latest ID: {e}")
            active_id = None

    if active_id:
        generate_fir_by_id(active_id, args.out)
    else:
        print("💡 Usage: python main.py --fir_id <UUID> OR python main.py --latest")
