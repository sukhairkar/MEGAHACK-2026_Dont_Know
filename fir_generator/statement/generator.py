import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_statement(data, lang="en"):
    system_message = """
You are a highly experienced professional Senior Legal Clerk and Police Inspector specializing in drafting First Information Reports (FIRs) for the Maharashtra Police. 

Your goal is to produce an EXHAUSTIVE, FORMAL, and EXTREMELY DETAILED legal narrative.
The output must be at least 1000-1200 words long. 
You must take the brief details provided and narrate them with cinematic and legal precision, expanding every point into multiple descriptive paragraphs.
Use a formal, authoritative, first-person perspective ('I, [Name], son/daughter of ..., residing at ...').
"""

    prompt = f"""
Using the following brief details, generate a comprehensive FIR statement in English.

**COMPLAINANT DETAILS:**
- Name: {data.get("name")}
- Age: {data.get("age")}
- Address: {data.get("address")}

**INCIDENT OVERVIEW:**
- Date: {data.get("date")}
- Time: {data.get("time")}
- Location: {data.get("location")}
- Initial Description: {data.get("description")}
- Suspect(s): {data.get("suspect")}
- Witness(es): {data.get("witness")}
- Evidence: {data.get("evidence")}
- **Property/Vehicle Details:** {data.get("property_details")}

**STRUCTURE YOUR NARRATIVE INTO THESE MANDATORY SECTIONS:**

1.  **INTRODUCTION AND PRELUDE:** Describe your background, your reason for being at the location, the atmosphere, and the events leading up to the incident in great detail.
2.  **THE MOMENT OF INCIDENT:** Provide a second-by-second account of what happened. Describe the sounds, the physical sensations, the exact movements of the suspects, and your immediate shock.
3.  **DETAILED SUSPECT PROFILING:** Even if the suspects are unknown, describe their behavior, body language, tone of voice, clothing, and any distinguishing marks or getaway vehicles in exhaustive detail.
4.  **ENVIRONMENTAL AND SITUATIONAL CONTEXT:** Describe the lighting, the crowd (or lack thereof), the weather, and the exact geographical layout of the crime scene.
5.  **PROPERTY AND EVIDENCE ANALYSIS:** Provide a deep description of any stolen items (referencing the **Property/Vehicle Details** above), their monetary and sentimental value, and how they were positioned before being taken. Describe the physical evidence left behind. 
6.  **AFTERMATH AND IMMEDIATE ACTIONS:** Detail your state of mind immediately after, who you called, who came to help, and any attempts to pursue or identify the culprit.
7.  **FORMAL REQUEST FOR ACTION:** Conclude with a strong legal demand for the registration of an FIR under relevant sections of the law, a thorough investigation, and the recovery of property.

**CRITICAL REQUIREMENT:** Do not be brief. Expand every single section above into multiple long, descriptive paragraphs. Weave the **Property/Vehicle Details** naturally into the narrative, especially in Section 5. Use formal legal vocabulary. The final output MUST be significantly long (aim for 1200 words).
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
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