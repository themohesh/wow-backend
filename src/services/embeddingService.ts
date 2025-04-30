import fetch from "node-fetch";
import config from "../config/env";

/**
 * Generate vector embedding for text using OpenAI API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check if API key is available
    if (!config.openai.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Truncate text if too long (OpenAI has token limits)
    const truncatedText = text.slice(0, 8000);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openai.apiKey}`,
      },
      body: JSON.stringify({
        input: truncatedText,
        model: "text-embedding-ada-002",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${
          typeof errorData === "object" &&
          errorData !== null &&
          "error" in errorData &&
          typeof (errorData as any).error?.message === "string"
            ? (errorData as any).error.message
            : "Unknown error"
        }`
      );
    }

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
    };
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
