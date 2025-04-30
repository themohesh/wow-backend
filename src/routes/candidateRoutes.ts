import express from "express";
import * as CandidateController from "../controllers/candidateController";
import { authenticate, requireCandidate } from "../middleware/auth";
import upload from "../middleware/upload";

const router = express.Router();

// All routes require authentication and candidate role
router.use(authenticate);
router.use(requireCandidate);

// Profile routes
router.post("/profile", CandidateController.createProfile);
router.put("/profile", CandidateController.updateProfile);
router.get("/profile", CandidateController.getProfile);

// Resume upload
router.post(
  "/resume",
  upload.single("resume"),
  CandidateController.uploadResume
);

// Matching routes
router.get("/matches", CandidateController.getMatchingJobs);

export default router;
