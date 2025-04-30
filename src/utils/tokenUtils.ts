import jwt from "jsonwebtoken";
import config from "../config/env";
import { User } from "../types";

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    userType: user.user_type,
  };

  return jwt.sign(payload, config.jwtSecret as string, {
    expiresIn: "24h",
  });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error("Invalid token");
  }
}
