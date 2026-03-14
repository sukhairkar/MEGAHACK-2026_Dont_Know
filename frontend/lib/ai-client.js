import Groq from "groq-sdk";

const PRIMARY_KEY = process.env.GROQ_API_KEY_PRIMARY;
const FALLBACK_KEY = process.env.GROQ_API_KEY_FALLBACK;

class AIClient {
  constructor() {
    this.client = new Groq({ apiKey: PRIMARY_KEY });
    this.isUsingFallback = false;
  }

  async getChatCompletion(options) {
    const primaryModel = options.model;
    const fallbackModel = "llama-3.1-8b-instant"; // High speed, high rate-limit fallback

    try {
      return await this.client.chat.completions.create(options);
    } catch (error) {
      console.error(`AI Client Error (${primaryModel}):`, error.message);
      
      // If primary hits rate limit (429) and we haven't tried the fallback model yet
      if (error.status === 429 && primaryModel !== fallbackModel) {
        console.warn(`Rate limited on ${primaryModel}. Retrying with fallback model ${fallbackModel}...`);
        return await this.client.chat.completions.create({
          ...options,
          model: fallbackModel
        });
      }

      // Key fallback logic (already exists, but kept for multi-tier resilience)
      if ((error.status === 429 || error.status === 500) && FALLBACK_KEY && !this.isUsingFallback) {
        console.warn("Switching to fallback Groq API key...");
        this.client = new Groq({ apiKey: FALLBACK_KEY });
        this.isUsingFallback = true;
        return await this.client.chat.completions.create(options);
      }
      
      throw error;
    }
  }

  reset() {
    this.client = new Groq({ apiKey: PRIMARY_KEY });
    this.isUsingFallback = false;
  }
}

const aiClient = new AIClient();
export default aiClient;
