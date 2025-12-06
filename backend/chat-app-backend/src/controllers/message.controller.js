import express from "express";
import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserFromSideBar = async (req , res)=>{
    try {
        const LoggedInUserId = req.user._id;
        const filtredUsers = await User.find({
            _id: {$ne:LoggedInUserId},
            isBanned: false
        }).select("-password");
        res.status(200).json(filtredUsers);
    } catch (error) {
        console.log("Error in getUsersFromSideBar : ",error.message);
        res.status(500).json({error: "Internal server error "});
    }
}

export const getMessages = async (req,res)=>{
    try {
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        
        // Pagination support (optional query params)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or:[
                {senderId:senderId,receiverId:receiverId},
                {senderId:receiverId,receiverId:senderId}
            ]
        })
        .sort({ createdAt: 1 }) // Sort by oldest first
        .skip(skip)
        .limit(limit);

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages : ",error.message);
        res.status(500).json({error: "Internal server error "});
    }
}

export const sendMessage = async (req,res) =>{
    try {
        const {text,image} = req.body;
        const {id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validate that at least text or image is provided
        if (!text && !image) {
            return res.status(400).json({ error: "Message must contain text or image" });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        let ImageUrl;
        if (image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            ImageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:ImageUrl
        })
        await newMessage.save();

        // Real-time functionality with socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage : ",error.message);
        res.status(500).json({error: "Internal server error "});
    }
}