import { Response } from "express";
import { AuthRequest } from "../types";
import * as MatchingService from "../services/matchingService";
import * as CandidateModel from "../models/CandidateProfile";
import * as EmployerModel from "../models/EmployerProfile";
import * as JobModel from "../models/JobListing";
import * as MatchModel from "../models/Match";

/**
 * Get matching candidates for a job
 */
export async function getMatchingCandidates(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.jobId);

    // Validate job ID
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Get employer profile
    const employerProfile = await EmployerModel.findEmployerProfileByUserId(
      userId
    );
    if (!employerProfile) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found",
      });
    }

    // Get job listing
    const job = await JobModel.findJobListingById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    // Check if job belongs to employer
    if (job.employer_id !== employerProfile.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this job",
      });
    }

    // Get matching candidates
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const matchingCandidates =
      await MatchingService.findMatchingCandidatesForJob(jobId, limit);

    // Save match results
    for (const candidate of matchingCandidates) {
      await MatchModel.createOrUpdateMatch(
        jobId,
        candidate.id,
        candidate.match_score
      );
    }

    return res.status(200).json({
      success: true,
      data: matchingCandidates,
    });
  } catch (error) {
    console.error("Get matching candidates error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving matching candidates",
    });
  }
}

/**
 * Get matching jobs for a candidate
 */
export async function getMatchingJobs(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

    // Get candidate profile
    const candidateProfile = await CandidateModel.findCandidateProfileByUserId(
      userId
    );
    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    // Get matching jobs
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const matchingJobs = await MatchingService.findMatchingJobsForCandidate(
      candidateProfile.id,
      limit
    );

    // Save match results
    for (const job of matchingJobs) {
      await MatchModel.createOrUpdateMatch(
        job.id,
        candidateProfile.id,
        job.match_score
      );
    }

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

/**
 * Candidate applies to job
 */
export async function applyToJob(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.jobId);

    // Validate job ID
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Get candidate profile
    const candidateProfile = await CandidateModel.findCandidateProfileByUserId(
      userId
    );
    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    // Get job listing
    const job = await JobModel.findJobListingById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    // Check if match exists
    const matchExists = await MatchModel.matchExists(
      jobId,
      candidateProfile.id
    );
    if (!matchExists) {
      // Create match if it doesn't exist
      await MatchModel.createOrUpdateMatch(jobId, candidateProfile.id, 0);
    }

    // Update candidate applied status
    await MatchModel.updateCandidateApplied(jobId, candidateProfile.id, true);

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Apply to job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error submitting application",
    });
  }
}

/**
 * Employer shows interest in candidate
 */
export async function showInterestInCandidate(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.jobId);
    const candidateId = parseInt(req.params.candidateId);

    // Validate IDs
    if (isNaN(jobId) || isNaN(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID or candidate ID",
      });
    }

    // Get employer profile
    const employerProfile = await EmployerModel.findEmployerProfileByUserId(
      userId
    );
    if (!employerProfile) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found",
      });
    }

    // Get job listing
    const job = await JobModel.findJobListingById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job listing not found",
      });
    }

    // Check if job belongs to employer
    if (job.employer_id !== employerProfile.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this job",
      });
    }

    // Check if candidate exists
    const candidate = await CandidateModel.findCandidateProfileById(
      candidateId
    );
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Check if match exists
    const matchExists = await MatchModel.matchExists(jobId, candidateId);
    if (!matchExists) {
      // Create match if it doesn't exist
      await MatchModel.createOrUpdateMatch(jobId, candidateId, 0);
    }

    // Update employer interest status
    await MatchModel.updateEmployerInterested(jobId, candidateId, true);

    return res.status(200).json({
      success: true,
      message: "Interest in candidate registered successfully",
    });
  } catch (error) {
    console.error("Show interest in candidate error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error registering interest",
    });
  }
}
