import pool from "../config/db";
import { User } from "../types";
import { hashPassword } from "../utils/passwordUtils";

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  userType: "candidate" | "employer"
): Promise<number> {
  const connection = await pool.getConnection();

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const [result] = (await connection.query(
      "INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)",
      [email, hashedPassword, userType]
    )) as any;

    return result.insertId;
  } finally {
    connection.release();
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  } finally {
    connection.release();
  }
}

/**
 * Find user by id
 */
export async function findUserById(id: number): Promise<User | null> {
  const connection = await pool.getConnection();

  try {
    const [rows] = (await connection.query(
      "SELECT id, email, user_type, created_at FROM users WHERE id = ?",
      [id]
    )) as any;

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as User;
  } finally {
    connection.release();
  }
}
