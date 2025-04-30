import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error:", err);

  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "This resource already exists";
  } else if (err.message.includes("Invalid token")) {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

/**
 * Not found middleware for handling undefined routes
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
