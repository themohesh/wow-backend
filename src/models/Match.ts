import pool from "../config/db";
import { Match } from "../types";

/**
 * Create or update a match
 */
export async function createOrUpdateMatch(
  jobId: number,
  candidateId: number,
  matchScore: number
): Promise<number> {
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
        "UPDATE matches SET match_score = ? WHERE id = ?",
        [matchScore, existingRows[0].id]
      );

      return existingRows[0].id;
    } else {
      // Insert new match
      const [result] = (await connection.query(
        "INSERT INTO matches (job_id, candidate_id, match_score) VALUES (?, ?, ?)",
        [jobId, candidateId, matchScore]
      )) as any;

      return result.insertId;
    }
  } finally {
    connection.release();
  }
}

/**
 * Update candidate application status
 */
export async function updateCandidateApplied(
  jobId: number,
  candidateId: number,
  applied: boolean
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result] = (await connection.query(
      "UPDATE matches SET candidate_applied = ? WHERE job_id = ? AND candidate_id = ?",
      [applied, jobId, candidateId]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Update employer interest status
 */
export async function updateEmployerInterested(
  jobId: number,
  candidateId: number,
  interested: boolean
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result] = (await connection.query(
      "UPDATE matches SET employer_interested = ? WHERE job_id = ? AND candidate_id = ?",
      [interested, jobId, candidateId]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Find matches by job ID
 */
export async function findMatchesByJobId(jobId: number): Promise<Match[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM matches WHERE job_id = ? ORDER BY match_score DESC",
      [jobId]
    )) as any;

    return rows as Match[];
  } finally {
    connection.release();
  }
}

/**
 * Find matches by candidate ID
 */
export async function findMatchesByCandidateId(
  candidateId: number
): Promise<Match[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM matches WHERE candidate_id = ? ORDER BY match_score DESC",
      [candidateId]
    )) as any;

    return rows as Match[];
  } finally {
    connection.release();
  }
}

/**
 * Check if match exists between job and candidate
 */
export async function matchExists(
  jobId: number,
  candidateId: number
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT id FROM matches WHERE job_id = ? AND candidate_id = ?",
      [jobId, candidateId]
    )) as any;

    return rows.length > 0;
  } finally {
    connection.release();
  }
}
