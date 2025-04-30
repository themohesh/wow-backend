import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import config from "./config/env";

// Import routes
import authRoutes from "./routes/authRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import employerRoutes from "./routes/employerRoutes";
import jobRoutes from "./routes/jobRoutes";
import matchingRoutes from "./routes/matchingRoutes";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
// app.use(cors({ origin: "*" }));
app.use(cors());
app.use(morgan("dev"));

// Static files
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Health check
app.get("/", (req, res) => {
  console.log("Health check endpoint hit");
  res.status(200).json({ status: "ok" });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/matching", matchingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Handle 404 errors
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
