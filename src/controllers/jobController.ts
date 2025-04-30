import { Response } from "express";
import { AuthRequest } from "../types";
import * as JobModel from "../models/JobListing";
import * as EmployerModel from "../models/EmployerProfile";

/**
 * Create job listing
 */
export async function createJob(req: AuthRequest, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;

    // Get employer profile
    const employerProfile = await EmployerModel.findEmployerProfileByUserId(
      userId
    );

    console.log("employerProfile", employerProfile, userId);
    if (!employerProfile) {
      return res.status(404).json({
        success: false,
        message: "Employer profile not found. Create a profile first.",
      });
    }

    // Extract job data from request
    const { title, description, requirements, location, salaryRange, jobType } =
      req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Create job listing
    const jobId = await JobModel.createJobListing(employerProfile.id, {
      title,
      description,
      requirements,
      location,
      salary_range: salaryRange,
      job_type: jobType,
    });

    // Get created job
    const job = await JobModel.findJobListingById(jobId);

    return res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating job listing",
    });
  }
}

/**
 * Update job listing
 */
export async function updateJob(req: AuthRequest, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.id);

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
        message: "You do not have permission to update this job",
      });
    }

    // Extract job data from request
    const { title, description, requirements, location, salaryRange, jobType } =
      req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Update job listing
    await JobModel.updateJobListing(jobId, {
      title,
      description,
      requirements,
      location,
      salary_range: salaryRange,
      job_type: jobType,
    });

    // Get updated job
    const updatedJob = await JobModel.findJobListingById(jobId);

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating job listing",
    });
  }
}

/**
 * Delete job listing
 */
export async function deleteJob(req: AuthRequest, res: Response): Promise<any> {
  try {
    const userId = req.user!.id;
    const jobId = parseInt(req.params.id);

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
        message: "You do not have permission to delete this job",
      });
    }

    // Delete job listing
    await JobModel.deleteJobListing(jobId);

    return res.status(200).json({
      success: true,
      message: "Job listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting job listing",
    });
  }
}

/**
 * Get job listing by ID
 */
export async function getJobById(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const jobId = parseInt(req.params.id);

    // Validate job ID
    if (isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
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

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving job listing",
    });
  }
}

/**
 * Get all jobs by employer
 */
export async function getEmployerJobs(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    const userId = req.user!.id;

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

    // Get employer jobs
    const jobs = await JobModel.findJobListingsByEmployerId(employerProfile.id);

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get employer jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving job listings",
    });
  }
}

/**
 * Get all jobs
 */
export async function getAllJobs(
  req: AuthRequest,
  res: Response
): Promise<any> {
  try {
    // Get all jobs
    const jobs = await JobModel.findAllJobListings();

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving job listings",
    });
  }
}
