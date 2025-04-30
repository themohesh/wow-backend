import path from "path";
import fs from "fs";
import { generateEmbedding } from "./embeddingService";

/**
 * Extract text content from a resume file
 * Note: In a production environment, you would use libraries like
 * pdf-parse, docx-parser, etc. for proper extraction.
 * This is a simplified implementation.
 */
export async function extractTextFromResume(filePath: string): Promise<string> {
  try {
    // Simplified implementation - in a real app, you would parse the actual content
    // based on file type (PDF, DOCX, etc.)
    const extension = path.extname(filePath).toLowerCase();

    // For this MVP, just return the file name as text content
    // In a real app, this would be replaced with actual parsing logic
    const fileStats = await fs.promises.stat(filePath);

    return `Resume file: ${path.basename(filePath)}\nSize: ${
      fileStats.size
    } bytes\nUploaded: ${fileStats.mtime}`;
  } catch (error) {
    console.error("Error extracting text from resume:", error);
    throw error;
  }
}

/**
 * Generate embedding from resume file
 */
export async function generateResumeEmbedding(
  resumePath: string
): Promise<number[]> {
  try {
    // Extract text from resume
    const text = await extractTextFromResume(resumePath);

    // Generate embedding from text
    return await generateEmbedding(text);
  } catch (error) {
    console.error("Error generating resume embedding:", error);
    throw error;
  }
}
