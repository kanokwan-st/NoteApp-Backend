import { User } from "../../../../models/User.js";

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
}
