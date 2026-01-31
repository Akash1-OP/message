import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "../backend/src/routes/auth.route.js";
import messageRoutes from "../backend/src/routes/message.route.js";
import { connectDB } from "../backend/src/lib/db.js";
import { ENV } from "../backend/src/lib/env.js";

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "SMS Chat Application Backend API", status: "ok" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Connect to database on startup
connectDB().catch((error) => {
  console.error("Failed to connect to database:", error.message);
});

export default app;
