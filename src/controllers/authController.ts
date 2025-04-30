import { Request, Response } from "express";
import { AuthRequest } from "../types";
import * as UserModel from "../models/User";
import { comparePassword } from "../utils/passwordUtils";
import { generateToken } from "../utils/tokenUtils";

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<any> {
  try {
    const { email, password, userType } = req.body;
    console.log("first", req.body);
    // Validate request
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and user type are required",
      });
    }

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if password is strong enough
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if userType is valid
    if (userType !== "candidate" && userType !== "employer") {
      return res.status(400).json({
        success: false,
        message: 'User type must be either "candidate" or "employer"',
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const userId = await UserModel.createUser(email, password, userType);

    // Get user data
    const user = await UserModel.findUserById(userId);

    // Generate token
    const token = generateToken(user!);

    // Return user data and token
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user!.id,
          email: user!.email,
          userType: user!.user_type,
          createdAt: user!.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password!);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    // User is attached to request in auth middleware
    const userId = req.user!.id;

    // Get user data
    const user = await UserModel.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving user data",
    });
  }
}
