import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  const indexFile = path.join(distPath, "index.html");

  // Only serve static files if the frontend build exists.
  if (fs.existsSync(distPath) && fs.existsSync(indexFile)) {
    app.use(express.static(distPath));

    app.get("*", (_, res) => {
      res.sendFile(indexFile);
    });
  } else {
    // Avoid throwing ENOENT on platforms where frontend isn't built or included.
    // Log a warning so the deployment doesn't fail when frontend files are absent.
    // The frontend can be deployed separately (recommended).
    // This prevents the JSON ENOENT error page on Vercel when dist is missing.
    // eslint-disable-next-line no-console
    console.warn("Frontend 'dist' not found — skipping static file serving.");
  }
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Start server
const serverInstance = server.listen(PORT, async () => {
  console.log("✅ Server running on port: " + PORT);
  console.log("🔄 Attempting to connect to MongoDB...");
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database:", error.message);
  }
  console.log("✅ Server initialization complete - ready to accept requests");
});

// Handle server errors
serverInstance.on("error", (error) => {
  console.error("Server error:", error);
});

// Graceful shutdown on CTRL+C
process.on("SIGINT", () => {
  console.log("\n⏹️  Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  console.error("Stack:", error.stack);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
  if (reason && reason.stack) {
    console.error("Stack:", reason.stack);
  }
});
