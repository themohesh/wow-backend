import express from "express";
import * as JobController from "../controllers/jobController";
import { authenticate, requireEmployer } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", JobController.getAllJobs);
router.get("/:id", JobController.getJobById);

// Protected routes
router.use(authenticate);

// Employer-only routes
router.post("/", requireEmployer, JobController.createJob);
router.put("/:id", requireEmployer, JobController.updateJob);
router.delete("/:id", requireEmployer, JobController.deleteJob);

export default router;
