import Groq from "groq-sdk";

const PRIMARY_KEY = process.env.GROQ_API_KEY_PRIMARY;
const FALLBACK_KEY = process.env.GROQ_API_KEY_FALLBACK;

class AIClient {
  constructor() {
    this.client = new Groq({ apiKey: PRIMARY_KEY });
    this.isUsingFallback = false;
  }

  async getChatCompletion(options) {
    try {
      return await this.client.chat.completions.create(options);
    } catch (error) {
      console.error("AI Client Error:", error.message);
      
      // If primary fails (e.g., rate limit 429), switch to fallback if available
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
