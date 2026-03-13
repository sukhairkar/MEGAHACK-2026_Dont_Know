import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

def translate_to_marathi(text):
    API_URL = "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {
        "inputs": text,
        "parameters": {
            "src_lang": "eng_Latn",
            "tgt_lang": "mar_Deva"
        }
    }

    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, list) and "translation_text" in data[0]:
            return data[0]["translation_text"]
        elif "translation_text" in data:
            return data["translation_text"]
    except Exception as e:
        print("Translation error:", e)

    return text