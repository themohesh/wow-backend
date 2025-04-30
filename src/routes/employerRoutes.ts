import express from "express";
import * as EmployerController from "../controllers/employerController";
import * as JobController from "../controllers/jobController";
import { authenticate, requireEmployer } from "../middleware/auth";

const router = express.Router();

// All routes require authentication and employer role
router.use(authenticate);
router.use(requireEmployer);

// Profile routes
router.post("/profile", EmployerController.createProfile);
router.put("/profile", EmployerController.updateProfile);
router.get("/profile", EmployerController.getProfile);

// Job routes (specific to employer)
router.get("/jobs", JobController.getEmployerJobs);

export default router;
