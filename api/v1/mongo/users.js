import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../models/User.js";
import { createUser, deleteUser, getAllUsers, login, register, updateUser } from "./controllers/usersController.js";
import { authUser } from "../../../middleware/auth.js";
const router = express.Router();

// Register a new user
router.post("/auth/register", register);

// Login a user
// router.post("/auth/login", login);

// Login a user - jwt signed token
router.post("/auth/cookie/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }, // send some safe public info if needed
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});


// GET Current User Profile (protected route)
router.get("/auth/profile", authUser, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password"); // exclude password
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  res.status(200).json({ error: false, user });
});


// Logout
router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

//------------------------------------//


// Get all users
router.get("/users", getAllUsers);

// Create a user
router.post("/users", createUser);

// Update a user
router.put("/users/:id", updateUser);

// Delete a user
router.delete("/users/:id", deleteUser);



export default router;
