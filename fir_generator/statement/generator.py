import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_statement(data, lang="en"):
    prompt = f"""
You are a highly experienced professional police report writer and legal clerk.

Using the details provided below, generate an EXTREMELY detailed, comprehensive, and exhaustive FIR-style incident report in English. 
The user specifically requested that this statement be at least THREE TIMES LONGER than a standard summary. You must expand significantly on every single detail provided.

Write in the first person ("I") from the perspective of the complainant. Use a highly professional, formal, and legal tone.

Your narrative MUST include all of the following, expanded into deep, multi-paragraph detail:
1. Complete Chronology: Describe the events leading up to the incident, the exact moment it occurred (minute by minute), and the immediate aftermath in exhaustive detail.
2. Environmental/Location Context: Describe the location thoroughly (lighting, crowds, weather, exact positioning).
3. Suspect Descriptions: Detail any physical traits, clothing, behavior, and exact actions of the suspects, even if unknown (describe the interaction).
4. Witness Observations: Detail who was around, their reactions, and what they might have seen or heard.
5. Evidence & Property: Deeply describe the stolen/affected property, its value, where it was kept, and how it was taken.
6. Emotional & Psychological Impact: Detail the shock, fear, or immediate reaction of the complainant.
7. Post-Incident Actions: Detail the steps taken immediately after the incident (e.g., looking for help, calling the police, trying to chase the suspect).
8. Formal Request for Investigation: Conclude with a strong, formal request for police action and justice.

CRITICAL INSTRUCTION: You MUST write AT LEAST 800 WORDS. The more detailed it is, the better. Expand on every single point above into multiple long paragraphs. Do not summarize or be brief.

DO NOT just list these items. Weave them into a continuous, highly detailed, formal legal narrative that is extremely long and thorough.

**Incident Details provided by the complainant:**

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
        max_tokens=4000
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