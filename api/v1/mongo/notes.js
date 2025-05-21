import express from "express";
import { Note } from "../../../models/Note.js";
import { createNote, getAllNotes } from "./controllers/notesController.js";
import { authUser } from "../../../middleware/auth.js";

const router = express.Router();

// GET all notes
router.get("/notes", getAllNotes);

// Create a note
router.post("/notes", createNote);

// Update a note
router.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedNote) {
      return res.status(404).send("Note not found");
    }
    res.status(200).json(updatedNote);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to update notes",
      details: err.message,
    });
  }
});

// Delete a note
router.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).send("Note not found");
    }
    res.status(204).json(deletedNote);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to delete notes",
      details: err.message,
    });
  }
});

// -----------------Authentication----------------------------

// Add note
router.post("/add-note", authUser, async (req, res) => {
  const { title, content, tags = [], isPinned = false } = req.body;

  const userId = req.user._id;

  if (!title || !content) {
    res.status(400).json({
      error: true,
      message: "All fields required!",
    });
  }

  if (!userId) {
    res.status(400).json({
      error: true,
      message: "Invalid user credentials!",
    });
  }

  try {
    const note = await Note.create({
      title,
      content,
      tags,
      isPinned,
      userId,
    });

    await note.save();
    res.json({
      error: false,
      note,
      message: "Note added successfully!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal Server error",
    });
  }
});

// Edit Note
router.put("/edit-note/:noteId", authUser, async (req, res) => {});

// Update isPinned
router.put("/update-note-pinned/:noteId", authUser, async (req, res) => {});

// Get all notes by user id
router.get("/get-all-notes", authUser, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ isPinned: -1 });
    res.json({
      error: false,
      notes,
      message: "All notes retreived!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// Delete note
router.delete("/delete-note/:noteId", authUser, async (req, res) => {});

// Search notes
router.get("/search-notes", authUser, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: true, message: "Search query is required!" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the serch query retrieved success!",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

export default router;
