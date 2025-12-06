import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

// Store online users: userId -> socketId
const userSocketMap = new Map();

export function getReceiverSocketId(userId) {
    return userSocketMap.get(userId);
}

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
        userSocketMap.set(userId, socket.id);
        
        // Update user online status in database
        User.findByIdAndUpdate(userId, { isOnline: true })
            .catch(err => console.error("Error updating online status:", err));

        // Broadcast to all clients about online users
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
        if (userId && userId !== "undefined") {
            userSocketMap.delete(userId);
            
            // Update user offline status in database
            User.findByIdAndUpdate(userId, { isOnline: false })
                .catch(err => console.error("Error updating offline status:", err));

            // Broadcast updated online users
            io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
        }
    });
});

export { io, server, app };
