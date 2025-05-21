import { User } from "../../../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



//Register user
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "All fields required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: true, message: "Email already in use." });
    }
    const user = new User({ name: fullName, email, password });

    await user.save();

    res.status(201).json({
      error: false,
      message: "User registered successfully!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
};

//Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      error: false,
      token,
      message: "Login successful!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
};



//------------------------------------//

//Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ error: false, users });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

//Create user
export const createUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    // prevent duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({
        error: true,
        message: "Email already in use!",
      });
    }

    // create and save new user (to db)
    const user = new User({ name, email });
    await user.save();

    res.status(201).json({
      error: false,
      user,
      message: "User created successfully!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
};

//Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to update users",
      details: err.message,
    });
  }
};

//Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    res.status(204).json(deletedUser);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete users",
      details: err.message,
    });
  }
};
