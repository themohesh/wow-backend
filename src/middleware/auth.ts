import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenUtils";
import { AuthRequest } from "../types";

/**
 * Authenticate requests by validating the JWT token
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    console.log("Decoded token:", decoded);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/**
 * Check if the authenticated user is a candidate
 */
export function requireCandidate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any {
  if (!req.user || req.user.userType !== "candidate") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Candidate role required.",
    });
  }
  next();
}

/**
 * Check if the authenticated user is an employer
 */
export function requireEmployer(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): any {
  if (!req.user || req.user.userType !== "employer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Employer role required.",
    });
  }
  next();
}
