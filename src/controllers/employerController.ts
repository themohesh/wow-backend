import { Response } from "express";
import { AuthRequest } from "../types";
import * as EmployerModel from "../models/EmployerProfile";

/**
 * Create employer profile
 */
export async function createProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Check if profile already exists
    const existingProfile = await EmployerModel.findEmployerProfileByUserId(
      userId
    );

    console.log("Existing profile:", existingProfile);

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists",
      });
    }

    // Extract profile data from request
    const { companyName, industry, description, location, website } = req.body;

    console.log("inside here mehak");

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Create profile
    const profileId = await EmployerModel.createEmployerProfile(userId, {
      company_name: companyName,
      industry,
      description,
      location,
      website,
    });

    // Get created profile
    const profile = await EmployerModel.findEmployerProfileById(profileId);

    console.log("Created profile:", profile);

    return res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create employer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating profile",
    });
  }
}

/**
 * Update employer profile
 */
export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Check if profile exists
    const existingProfile = await EmployerModel.findEmployerProfileByUserId(
      userId
    );
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Extract profile data from request
    const { companyName, industry, description, location, website } = req.body;

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Update profile
    await EmployerModel.updateEmployerProfile(existingProfile.id, {
      company_name: companyName,
      industry,
      description,
      location,
      website,
    });

    // Get updated profile
    const updatedProfile = await EmployerModel.findEmployerProfileById(
      existingProfile.id
    );

    return res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update employer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
}

/**
 * Get employer profile
 */
export async function getProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Get profile
    const profile = await EmployerModel.findEmployerProfileByUserId(userId);
    console.log("Profile:", profile, userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get employer profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving profile",
    });
  }
}
