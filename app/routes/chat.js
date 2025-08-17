import express from "express";
import ChatMessage from "../models/ChatMessage.js";
import { getIO } from "../utils/socket.js";

const router = express.Router();

// ✅ Get last 50 messages
router.get("/", async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate("user", "name email") // include user info
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse()); // send oldest → newest
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Post new message (no JWT check, just trust frontend)
router.post("/", async (req, res) => {
  try {
    const { user, text } = req.body; // frontend must send user + text
    if (!text || !user) {
      return res.status(400).json({ message: "User + Message text required" });
    }

    const newMsg = new ChatMessage({
      user: user._id,
      text,
    });
    await newMsg.save();

    // Broadcast via socket.io
    const io = getIO();
    io.emit("chatMessage", {
      id: newMsg._id,
      user: { _id: user._id, name: user.name },
      text: newMsg.text,
      time: newMsg.createdAt,
    });

    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
