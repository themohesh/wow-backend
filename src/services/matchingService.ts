import pool from "../config/db";
import { cosineSimilarity } from "../utils/vectorUtils";
import { JobWithMatchScore, CandidateWithMatchScore } from "../types";

/**
 * Find matching jobs for a candidate based on vector similarity
 */
export async function findMatchingJobsForCandidate(
  candidateId: number,
  limit: number = 10
): Promise<JobWithMatchScore[]> {
  const connection = await pool.getConnection();

  try {
    // Get candidate embedding
    const [candidateRows] = (await connection.query(
      "SELECT vector_embedding FROM candidate_profiles WHERE id = ?",
      [candidateId]
    )) as any;

    if (!candidateRows.length) {
      throw new Error("Candidate profile not found");
    }

    const candidateEmbedding = JSON.parse(candidateRows[0].vector_embedding);

    // Get all jobs with their embeddings and company info
    const [jobRows] = (await connection.query(`
      SELECT j.*, e.company_name
      FROM job_listings j
      JOIN employer_profiles e ON j.employer_id = e.id
      WHERE j.vector_embedding IS NOT NULL
    `)) as any;

    // Calculate similarity scores
    const matchedJobs = jobRows.map((job: any) => {
      const jobEmbedding = JSON.parse(job.vector_embedding);
      const score = cosineSimilarity(candidateEmbedding, jobEmbedding);

      return {
        ...job,
        match_score: score,
      };
    });

    // Sort by match score (descending) and limit results
    return matchedJobs
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, limit);
  } finally {
    connection.release();
  }
}

/**
 * Find matching candidates for a job based on vector similarity
 */
export async function findMatchingCandidatesForJob(
  jobId: number,
  limit: number = 10
): Promise<CandidateWithMatchScore[]> {
  const connection = await pool.getConnection();

  try {
    // Get job embedding
    const [jobRows] = (await connection.query(
      "SELECT vector_embedding FROM job_listings WHERE id = ?",
      [jobId]
    )) as any;

    if (!jobRows.length) {
      throw new Error("Job listing not found");
    }

    const jobEmbedding = JSON.parse(jobRows[0].vector_embedding);

    // Get all candidates with their embeddings and email
    const [candidateRows] = (await connection.query(`
      SELECT c.*, u.email
      FROM candidate_profiles c
      JOIN users u ON c.user_id = u.id
      WHERE c.vector_embedding IS NOT NULL
    `)) as any;

    // Calculate similarity scores
    const matchedCandidates = candidateRows.map((candidate: any) => {
      const candidateEmbedding = JSON.parse(candidate.vector_embedding);
      const score = cosineSimilarity(jobEmbedding, candidateEmbedding);

      return {
        ...candidate,
        match_score: score,
      };
    });

    // Sort by match score (descending) and limit results
    return matchedCandidates
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, limit);
  } finally {
    connection.release();
  }
}

/**
 * Save match result to database
 */
export async function saveMatch(
  jobId: number,
  candidateId: number,
  matchScore: number
): Promise<void> {
  const connection = await pool.getConnection();

  try {
    // Check if match already exists
    const [existingRows] = (await connection.query(
      "SELECT id FROM matches WHERE job_id = ? AND candidate_id = ?",
      [jobId, candidateId]
    )) as any;

    if (existingRows.length > 0) {
      // Update existing match
      await connection.query(
        "UPDATE matches SET match_score = ? WHERE job_id = ? AND candidate_id = ?",
        [matchScore, jobId, candidateId]
      );
    } else {
      // Insert new match
      await connection.query(
        "INSERT INTO matches (job_id, candidate_id, match_score) VALUES (?, ?, ?)",
        [jobId, candidateId, matchScore]
      );
    }
  } finally {
    connection.release();
  }
}
