import pool from "../config/db";
import { CandidateProfile } from "../types";
import { generateEmbedding } from "../services/embeddingService";

/**
 * Create a candidate profile
 */
export async function createCandidateProfile(
  userId: number,
  profile: Partial<CandidateProfile>
): Promise<number> {
  const connection = await pool.getConnection();

  try {
    // Generate profile text for embedding
    const profileText = [
      profile.full_name,
      profile.headline,
      profile.summary,
      profile.skills,
      profile.experience,
      profile.education,
    ]
      .filter(Boolean)
      .join(" ");

    // Generate embedding if there's enough content
    let embedding = null;
    if (profileText.trim().length > 0) {
      const vectors = await generateEmbedding(profileText);
      embedding = JSON.stringify(vectors);
    }

    // Insert profile into database
    const [result] = (await connection.query(
      `INSERT INTO candidate_profiles (
        user_id, full_name, headline, summary, skills, experience, education, vector_embedding
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        profile.full_name,
        profile.headline || null,
        profile.summary || null,
        profile.skills || null,
        profile.experience || null,
        profile.education || null,
        embedding,
      ]
    )) as any;

    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * Update a candidate profile
 */
export async function updateCandidateProfile(
  id: number,
  profile: Partial<CandidateProfile>
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    // Generate profile text for embedding
    const profileText = [
      profile.full_name,
      profile.headline,
      profile.summary,
      profile.skills,
      profile.experience,
      profile.education,
    ]
      .filter(Boolean)
      .join(" ");

    // Generate embedding if there's enough content
    let embedding = null;
    if (profileText.trim().length > 0) {
      const vectors = await generateEmbedding(profileText);
      embedding = JSON.stringify(vectors);
    }

    // Update profile in database
    const [result] = (await connection.query(
      `UPDATE candidate_profiles SET
        full_name = ?,
        headline = ?,
        summary = ?,
        skills = ?,
        experience = ?,
        education = ?,
        vector_embedding = ?
      WHERE id = ?`,
      [
        profile.full_name,
        profile.headline || null,
        profile.summary || null,
        profile.skills || null,
        profile.experience || null,
        profile.education || null,
        embedding,
        id,
      ]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Update resume URL and generate embedding
 */
export async function updateResumeUrl(
  id: number,
  resumeUrl: string,
  resumeEmbedding: number[]
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result] = (await connection.query(
      "UPDATE candidate_profiles SET resume_url = ?, vector_embedding = ? WHERE id = ?",
      [resumeUrl, JSON.stringify(resumeEmbedding), id]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Find candidate profile by user ID
 */
export async function findCandidateProfileByUserId(
  userId: number
): Promise<CandidateProfile | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM candidate_profiles WHERE user_id = ?",
      [userId]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as CandidateProfile;
  } finally {
    connection.release();
  }
}

/**
 * Find candidate profile by ID
 */
export async function findCandidateProfileById(
  id: number
): Promise<CandidateProfile | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM candidate_profiles WHERE id = ?",
      [id]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as CandidateProfile;
  } finally {
    connection.release();
  }
}
