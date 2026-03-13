import requests
import json

def test_suggest_ipc(incident_text, severity):
    """
    Calls the /suggest-ipc endpoint and prints the results.
    """
    url = "http://localhost:8000/suggest-ipc"
    payload = {
        "incident_text": incident_text,
        "severity": severity
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    try:
        print(f"--- Sending Request ---")
        print(f"Incident: {incident_text}")
        print(f"Severity: {severity}\n")
        
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        if response.status_code == 200:
            suggestions = response.json()
            print("--- Top 3 Suggested IPC Sections ---")
            for i, suggestion in enumerate(suggestions, 1):
                print(f"{i}. {suggestion['section']}: {suggestion['title']}")
                print(f"   Description: {suggestion['description']}")
                print(f"   Reason: {suggestion['reason_for_application']}\n")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)

    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure main.py is running.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Example 1: Theft
    test_suggest_ipc(
        incident_text="A man snatched my gold chain while I was walking in the park.",
        severity="medium"
    )
    
    # Example 2: Murder attempt
    test_suggest_ipc(
        incident_text="The suspect attacked the victim with a knife with the intention to kill.",
        severity="high"
    )

    # Example 3: Cheating
    test_suggest_ipc(
        incident_text="The contractor took the money but never started the construction work, and now he is not answering calls.",
        severity="medium"
    )
