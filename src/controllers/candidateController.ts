import { Response } from "express";
import { AuthRequest } from "../types";
import * as CandidateModel from "../models/CandidateProfile";
import * as UserModel from "../models/User";
import * as MatchingService from "../services/matchingService";
import * as ResumeService from "../services/resumeParsingService";
import path from "path";
import config from "../config/env";

/**
 * Create candidate profile
 */
export async function createProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Check if profile already exists
    const existingProfile = await CandidateModel.findCandidateProfileByUserId(
      userId
    );
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists",
      });
    }

    // Extract profile data from request
    const { fullName, headline, summary, skills, experience, education } =
      req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    // Create profile
    const profileId = await CandidateModel.createCandidateProfile(userId, {
      full_name: fullName,
      headline,
      summary,
      skills,
      experience,
      education,
    });

    // Get created profile
    const profile = await CandidateModel.findCandidateProfileById(profileId);

    return res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create candidate profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating profile",
    });
  }
}

/**
 * Update candidate profile
 */
export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Check if profile exists
    const existingProfile = await CandidateModel.findCandidateProfileByUserId(
      userId
    );
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Extract profile data from request
    const { fullName, headline, summary, skills, experience, education } =
      req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    // Update profile
    await CandidateModel.updateCandidateProfile(existingProfile.id, {
      full_name: fullName,
      headline,
      summary,
      skills,
      experience,
      education,
    });

    // Get updated profile
    const updatedProfile = await CandidateModel.findCandidateProfileById(
      existingProfile.id
    );

    return res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update candidate profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
}

/**
 * Get candidate profile
 */
export async function getProfile(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Get profile
    const profile = await CandidateModel.findCandidateProfileByUserId(userId);
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
    console.error("Get candidate profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving profile",
    });
  }
}

/**
 * Upload resume
 */
export async function uploadResume(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Check if profile exists
    const profile = await CandidateModel.findCandidateProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Create profile first.",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    // Get resume path
    const resumePath = req.file.path;
    const resumeUrl = `/uploads/${path.basename(resumePath)}`;

    // Generate embedding from resume
    const embedding = await ResumeService.generateResumeEmbedding(resumePath);

    // Update profile with resume URL and embedding
    await CandidateModel.updateResumeUrl(profile.id, resumeUrl, embedding);

    return res.status(200).json({
      success: true,
      data: {
        message: "Resume uploaded successfully",
        resumeUrl,
      },
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error uploading resume",
    });
  }
}

/**
 * Get matching jobs
 */
export async function getMatchingJobs(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Get profile
    const profile = await CandidateModel.findCandidateProfileByUserId(userId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Get matching jobs
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const matchingJobs = await MatchingService.findMatchingJobsForCandidate(
      profile.id,
      limit
    );

    return res.status(200).json({
      success: true,
      data: matchingJobs,
    });
  } catch (error) {
    console.error("Get matching jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving matching jobs",
    });
  }
}
