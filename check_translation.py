import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

def test_model(model_id, payload):
    API_URL = f"https://api-inference.huggingface.co/models/{model_id}"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        print(f"--- Model: {model_id} ---")
        print(f"Status: {resp.status_code}")
        try:
            print("Response:", json.dumps(resp.json(), indent=2))
        except:
            print("Response (not JSON):", resp.text)
    except Exception as e:
        print(f"Exception: {e}")

# Test Helsinki-NLP/opus-mt-en-mr
test_model("Helsinki-NLP/opus-mt-en-mr", {
    "inputs": "The incident occurred yesterday at 5 PM."
})
