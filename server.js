import express from "express";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import apiRoutes from "./api/v1/routes.js";
import router from "./sparenotes.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import cors from "cors"; 

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", "https://note-app-frontend-miniproject.vercel.app"], // Allow frontend port 5173 and vercel to access backend
  credentials: true
}))

app.use(express.json());

// Turso
const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});



(async () => {
  // Connect to MongoDB via Mongoose
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to Mongo database ✅");
  } catch(err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }

  // Ping Turso
  try {
    await db.execute("SELECT 1");
    console.log("Checked successful communication with Turso database ✅");
  } catch (err) {
    console.error("❌ Failed to connect to Turso:", err);
    process.exit(1);
  }

  // Initialize the tables (users, notes) สร้างตาราง Schema for Turso
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT, --JSON-encoded array of strings
      is_pinned INTEGER DEFAULT 0,-- 0 = false, 1 = true
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER
    );
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);
})();


// Link to center of Routes
app.use("/", apiRoutes(db));

// sparenotes
app.use("/sparenotes", router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} ✅`);
});
