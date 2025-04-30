import pool from "../config/db";
import { JobListing, JobWithCompany } from "../types";
import { generateEmbedding } from "../services/embeddingService";

/**
 * Create a job listing
 */
export async function createJobListing(
  employerId: number,
  job: Partial<JobListing>
): Promise<number> {
  const connection = await pool.getConnection();

  try {
    // Generate job text for embedding
    const jobText = [job.title, job.description, job.requirements]
      .filter(Boolean)
      .join(" ");

    // Generate embedding
    const vectors = await generateEmbedding(jobText);
    const embedding = JSON.stringify(vectors);

    // Insert job into database
    const [result] = (await connection.query(
      `INSERT INTO job_listings (
        employer_id, title, description, requirements, location, 
        salary_range, job_type, vector_embedding
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        job.title,
        job.description,
        job.requirements || null,
        job.location || null,
        job.salary_range || null,
        job.job_type || null,
        embedding,
      ]
    )) as any;

    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * Update a job listing
 */
export async function updateJobListing(
  id: number,
  job: Partial<JobListing>
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    // Generate job text for embedding
    const jobText = [job.title, job.description, job.requirements]
      .filter(Boolean)
      .join(" ");

    // Generate embedding
    const vectors = await generateEmbedding(jobText);
    const embedding = JSON.stringify(vectors);

    // Update job in database
    const [result] = (await connection.query(
      `UPDATE job_listings SET
        title = ?,
        description = ?,
        requirements = ?,
        location = ?,
        salary_range = ?,
        job_type = ?,
        vector_embedding = ?
      WHERE id = ?`,
      [
        job.title,
        job.description,
        job.requirements || null,
        job.location || null,
        job.salary_range || null,
        job.job_type || null,
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
 * Delete a job listing
 */
export async function deleteJobListing(id: number): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result] = (await connection.query(
      "DELETE FROM job_listings WHERE id = ?",
      [id]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Find all job listings by employer ID
 */
export async function findJobListingsByEmployerId(
  employerId: number
): Promise<JobListing[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM job_listings WHERE employer_id = ? ORDER BY created_at DESC",
      [employerId]
    )) as any;

    return rows as JobListing[];
  } finally {
    connection.release();
  }
}

/**
 * Find job listing by ID
 */
export async function findJobListingById(
  id: number
): Promise<JobWithCompany | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      `SELECT j.*, e.company_name
         FROM job_listings j
         JOIN employer_profiles e ON j.employer_id = e.id
         WHERE j.id = ?`,
      [id]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as JobWithCompany;
  } finally {
    connection.release();
  }
}

/**
 * Find all job listings with company info
 */
export async function findAllJobListings(): Promise<JobWithCompany[]> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      `SELECT j.*, e.company_name
         FROM job_listings j
         JOIN employer_profiles e ON j.employer_id = e.id
         ORDER BY j.created_at DESC`
    )) as any;

    return rows as JobWithCompany[];
  } finally {
    connection.release();
  }
}
