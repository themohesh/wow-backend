import mysql from "mysql2/promise";
import config from "./env";

// Create connection pool
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database with tables
export async function initDb() {
  const connection = await pool.getConnection();

  try {
    // Create tables if they don't exist
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        user_type ENUM('candidate', 'employer') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Candidate profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        headline VARCHAR(255),
        summary TEXT,
        skills TEXT,
        experience TEXT,
        education TEXT,
        resume_url VARCHAR(255),
        vector_embedding JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Employer profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employer_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Job listings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_listings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employer_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255),
        salary_range VARCHAR(100),
        job_type ENUM('full-time', 'part-time', 'contract', 'internship'),
        vector_embedding JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE
      )
    `);

    // Matches table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT PRIMARY KEY AUTO_INCREMENT,
        job_id INT NOT NULL,
        candidate_id INT NOT NULL,
        match_score FLOAT NOT NULL,
        candidate_applied BOOLEAN DEFAULT FALSE,
        employer_interested BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (job_id, candidate_id),
        FOREIGN KEY (job_id) REFERENCES job_listings(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
