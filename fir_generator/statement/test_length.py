import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from statement.generator import generate_statement

def test_statement_length():
    data = {
        "name": "Rajesh Kumar",
        "age": "45",
        "address": "Flat 402, Shiv Shakti Apartments, Andheri East, Mumbai",
        "date": "2026-03-14",
        "time": "21:30",
        "location": "Near Juhu Beach, Vile Parle West",
        "description": "I was walking back from the beach when two men on a black Pulsar bike snatched my gold chain worth 1.5 lakhs and sped away towards Santacruz.",
        "suspect": "Two men, one wearing a red helmet, other with a black jacket, roughly 25-30 years old.",
        "witness": "A coconut seller nearby and a few morning walkers.",
        "evidence": "CCTV cameras at the junction might have captured the bike number."
    }

    print("🤖 Generating enhanced statement...")
    statement = generate_statement(data, lang="en")
    
    word_count = len(statement.split())
    print("\n" + "="*50)
    print(f"📄 GENERATED STATEMENT (Word Count: {word_count})")
    print("="*50)
    print(statement[:1500] + "...") # Print first 1500 chars
    print("="*50)
    
    if word_count > 600:
        print(f"✅ SUCCESS: Statement is sufficiently long ({word_count} words).")
    else:
        print(f"❌ FAILURE: Statement is too short ({word_count} words). Goal was ~1000.")

if __name__ == "__main__":
    test_statement_length()
