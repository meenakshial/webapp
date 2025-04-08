import { log } from "./vite";

interface GroqMessage {
  role: string;
  content: string;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finishReason: string | null;
  }[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function callGroqAPI(messages: GroqMessage[], model = "llama3-70b-8192") {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      log(`Groq API error: ${errorData}`, "groq");
      throw new Error(`Groq API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json() as GroqResponse;
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    log(`Error calling Groq API: ${(error as Error).message}`, "groq");
    throw error;
  }
}

export async function getAvailableModels() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      log(`Groq API error when fetching models: ${errorData}`, "groq");
      throw new Error(`Groq API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    log(`Error calling Groq API for models: ${(error as Error).message}`, "groq");
    throw error;
  }
}
