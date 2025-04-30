import { Request } from "express";

// Extend Express Request type to include user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: "candidate" | "employer";
  };
}

// User types
export interface User {
  id: number;
  email: string;
  password?: string;
  user_type: "candidate" | "employer";
  created_at: Date;
}

// Candidate profile types
export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name: string;
  headline?: string;
  summary?: string;
  skills?: string;
  experience?: string;
  education?: string;
  resume_url?: string;
  vector_embedding?: any;
  created_at: Date;
  updated_at: Date;
}

// Employer profile types
export interface EmployerProfile {
  id: number;
  user_id: number;
  company_name: string;
  industry?: string;
  description?: string;
  location?: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
}

// Job listing types
export interface JobListing {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  job_type?: "full-time" | "part-time" | "contract" | "internship";
  vector_embedding?: any;
  created_at: Date;
  updated_at: Date;
}

// Match types
export interface Match {
  id: number;
  job_id: number;
  candidate_id: number;
  match_score: number;
  candidate_applied: boolean;
  employer_interested: boolean;
  created_at: Date;
}

// DTO types
export interface JobWithCompany extends JobListing {
  company_name: string;
}

export interface JobWithMatchScore extends JobWithCompany {
  match_score: number;
}

export interface CandidateWithMatchScore extends CandidateProfile {
  match_score: number;
  email: string;
}
