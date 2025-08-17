// utils/socket.js
import { Server } from "socket.io";
import ChatMessage from "../models/ChatMessage.js";

let io;

export const initIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    // -------------------------
    // Auction: Place Bid
    // -------------------------
    socket.on("placeBid", (data) => {
      console.log("📢 Bid received:", data);
      io.emit("bidUpdated", data); // broadcast to all clients
    });

    // -------------------------
    // Community Chat
    // -------------------------
    socket.on("chatMessage", async (msg) => {
      try {
        
        if (!msg.userId || !msg.userName || !msg.text) {
          console.log("⚠️ Invalid chat message:", msg);
          return;
        }

        // Save to DB
        const newMsg = new ChatMessage({
          user: msg.userId,
          text: msg.text,
        });
        await newMsg.save();

        // Broadcast to all clients
        io.emit("chatMessage", {
          id: newMsg._id,
          user: msg.userName, // passed from frontend
          text: newMsg.text,
          time: newMsg.createdAt,
        });
      } catch (err) {
        console.error("❌ Error saving chat:", err.message);
      }
    });

    // -------------------------
    // Disconnect
    // -------------------------
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
