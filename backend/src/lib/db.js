import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const { MONGO_URI } = ENV;
    if (!MONGO_URI) throw new Error("MONGO_URI is not set");

    console.log(
      "🔗 Connecting to MongoDB with URI:",
      MONGO_URI.substring(0, 50) + "...",
    );
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("✅ MONGODB CONNECTED:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MONGODB:", error.message);
    console.warn(
      "⚠️  Database connection failed. Server will continue running, but database features will not work.",
    );
    console.warn("📋 To fix this, please whitelist your IP in MongoDB Atlas:");
    console.warn("   1. Go to: https://cloud.mongodb.com/");
    console.warn("   2. Network Access → Add IP Address");
    console.warn(
      "   3. Select 'Allow Access from Anywhere' or add your current IP",
    );
    // Don't exit - allow server to run for API testing
  }
};
