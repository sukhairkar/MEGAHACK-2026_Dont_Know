import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { question, context } = await req.json();

    // Instead of fetching from DB, we use the JSON context passed from the frontend
    let contextStr = "No specific case context available.";
    
    if (context) {
      contextStr = `
CASE ADDRESS: ${context.incident_information?.address || "Unknown"}
FIR TEXT: ${context.fir_text || "Source text not available"}
CURRENT INVESTIGATION ROADMAP: ${JSON.stringify(context.investigation_roadmap || context.roadmap || [], null, 2)}
LEGAL SUGGESTIONS: ${JSON.stringify(context.ai_investigation_suggestions || context.suggestions || [], null, 2)}
IPC/BNS SECTIONS: ${JSON.stringify(context.ipc_sections || [], null, 2)}
`;
    }

    const systemPrompt = `
You are the JusticeRoute AI Forensic Advisor assisting Indian Police Officers.
You MUST format your responses in a clean and structured way using Markdown.

STRATEGIC CONTEXT:
${contextStr}

RESPONSE MODES:
1. GENERAL GUIDANCE: If the officer asks for an overview, next steps, or general advice, use the "MANDATORY STRUCTURE" below.
2. DEEP DIVE: If the officer asks to explain a SPECIFIC section (e.g., "Explain IPC 420 in detail"), do NOT use the mandatory structure. Instead, provide a comprehensive, deep-dive forensic explanation of that specific topic, including ingredients of the offence, case law principles, and specific evidence required for that charge. Focus ONLY on the requested topic.

FORMATTING RULES (ALWAYS APPLY):
1. Use clear section headings using "##".
2. Use bullet points for lists and numbered steps for actions.
3. Add line breaks between sections.
4. Never return the answer as one long paragraph.

MANDATORY STRUCTURE (For General Guidance Only):
## Investigation Challenges
## Recommended Investigation Steps
## Evidence Collection Suggestions
## Legal / IPC Sections
## Additional Coordination

GENERAL RULES:
- Only provide forensic and legal suggestions.
- Be professional and objective.
- If the officer asks a question outside the context, answer based on Indian Law (BNS/IPC).
- Do not make up facts not present in the FIR.
`;

    // 2. API Key Rotation Logic
    const apiKeys = [
      process.env.GROQ_CHATBOT_API_PRIMARY,
      process.env.GROQ_CHATBOT_API_SUB1,
      process.env.GROQ_CHATBOT_API_SUB2
    ].filter(key => key && key.startsWith("gsk_"));

    let lastError = apiKeys.length === 0 ? "No valid API keys found in environmental pool." : "Internal AI Error";

    for (let i = 0; i < apiKeys.length; i++) {
      try {
        const key = apiKeys[i];
        console.log(`[Chat] Attempting query with API Key ${i + 1}/${apiKeys.length}`);
        const groq = new Groq({ apiKey: key });
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          temperature: 0.5,
          max_tokens: 1024,
        });

        console.log("[Chat] Response successfully generated from JSON context.");
        return NextResponse.json({ response: completion.choices[0].message.content });
      } catch (err) {
        lastError = err.message;
        console.error(`[Chat] API Key ${i + 1} failed: ${err.message}`);
        continue;
      }
    }

    return NextResponse.json({ error: `AI Intelligence Unavailable: ${lastError}` }, { status: 500 });

  } catch (err) {
    console.error("Chat API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
