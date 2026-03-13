import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_statement(data, lang="en"):
    prompt = f"""
You are a professional police report writer.

Using the details below, generate a detailed FIR-style incident report.
Write in first person, multi-paragraph, legal-professional tone, including:
- Chronology
- Witnesses
- Suspects
- Evidence
- Safety measures
- Social impact

Name: {data.get("name")}
Age: {data.get("age")}
Address: {data.get("address")}
Date: {data.get("date")}
Time: {data.get("time")}
Location: {data.get("location")}
Description: {data.get("description")}
Suspect: {data.get("suspect")}
Witness: {data.get("witness")}
Evidence: {data.get("evidence")}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role":"user","content":prompt}],
        temperature=0.7,
        max_tokens=2500
    )

    statement_en = response.choices[0].message.content

    if lang.lower() == "mar":
        translation_prompt = f"Translate the following incident report precisely into Marathi (Marathi language). Maintain the professional legal tone. Return ONLY the translated Marathi text.\n\n{statement_en}"
        
        translation_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":translation_prompt}],
            temperature=0.3,
            max_tokens=2500
        )
        return translation_response.choices[0].message.content

    return statement_en