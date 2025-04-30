import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "mahesh",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  database: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    name: process.env.DB_NAME || "mysql",
    port: parseInt(process.env.DB_PORT || "3306"),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  uploadDir: process.env.UPLOAD_DIR || "uploads/",
};
