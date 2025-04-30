/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  // Calculate dot product
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  // Calculate magnitude of each vector
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Calculate cosine similarity
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find closest vectors by cosine similarity
 */
export function findClosestVectors(
  targetVector: number[],
  vectors: { id: number; vector: number[] }[],
  limit: number = 10,
  threshold: number = 0.7
): { id: number; score: number }[] {
  // Calculate similarity scores
  const scores = vectors.map((item) => ({
    id: item.id,
    score: cosineSimilarity(targetVector, item.vector),
  }));

  // Filter by threshold, sort by score (descending) and limit results
  return scores
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
