import sys
import os
# Add src to path just in case
sys.path.append(os.path.join(os.getcwd(), 'src'))

try:
    from src.ipc_suggestion.suggester import IPCSuggester
    print("✅ Import successful")
    s = IPCSuggester()
    incident = "My car was stolen from the parking lot."
    res = s.suggest(incident)
    print(f"✅ Suggestions: {[r['section'] for r in res]}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
