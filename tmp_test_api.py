import requests
import json

url = "http://127.0.0.1:8000/generate-statement"
data = {
    "name": "John Doe",
    "age": "30",
    "address": "123 Main St",
    "date": "2026-03-13",
    "time": "12:00",
    "location": "Downtown",
    "description": "A minor theft occurred at the market.",
    "suspect": "Unknown",
    "witness": "None",
    "evidence": "CCTV footage",
    "language": "mar"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
