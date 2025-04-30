import pool from "../config/db";
import { EmployerProfile } from "../types";

/**
 * Create an employer profile
 */
export async function createEmployerProfile(
  userId: number,
  profile: Partial<EmployerProfile>
): Promise<number> {
  const connection = await pool.getConnection();

  console.log("Creating employer profile", profile);

  try {
    const [result] = (await connection.query(
      `INSERT INTO employer_profiles (
        user_id, company_name, industry, description, location, website
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        profile.company_name,
        profile.industry || null,
        profile.description || null,
        profile.location || null,
        profile.website || null,
      ]
    )) as any;

    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * Update an employer profile
 */
export async function updateEmployerProfile(
  id: number,
  profile: Partial<EmployerProfile>
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    const [result] = (await connection.query(
      `UPDATE employer_profiles SET
        company_name = ?,
        industry = ?,
        description = ?,
        location = ?,
        website = ?
      WHERE id = ?`,
      [
        profile.company_name,
        profile.industry || null,
        profile.description || null,
        profile.location || null,
        profile.website || null,
        id,
      ]
    )) as any;

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

/**
 * Find employer profile by user ID
 */
export async function findEmployerProfileByUserId(
  userId: number
): Promise<EmployerProfile | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM user WHERE user_id = ?",
      [userId]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as EmployerProfile;
  } finally {
    connection.release();
  }
}

/**
 * Find employer profile by ID
 */
export async function findEmployerProfileById(
  id: number
): Promise<EmployerProfile | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM employer_profiles WHERE id = ?",
      [id]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as EmployerProfile;
  } finally {
    connection.release();
  }
}
