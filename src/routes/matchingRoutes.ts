import express from "express";
import * as MatchingController from "../controllers/matchingController";
import {
  authenticate,
  requireCandidate,
  requireEmployer,
} from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Candidate routes
router.get("/jobs", requireCandidate, MatchingController.getMatchingJobs);
router.post(
  "/jobs/:jobId/apply",
  requireCandidate,
  MatchingController.applyToJob
);

// Employer routes
router.get(
  "/jobs/:jobId/candidates",
  requireEmployer,
  MatchingController.getMatchingCandidates
);
router.post(
  "/jobs/:jobId/candidates/:candidateId/interest",
  requireEmployer,
  MatchingController.showInterestInCandidate
);

export default router;
