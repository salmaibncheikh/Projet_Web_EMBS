//Only Admins 

import express from "express";
import User from "../models/user.model.js";




export const banUser = async (req , res) =>{
    const { id:userId } = req.params;
    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // verify if the banner is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to ban users" });
        }
        
        const user = await User.findOne({_id :userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBanned = true; 
        await user.save();
        res.status(200).json({ message: "User banned successfully" });
    } catch (error) {
        console.log("Error in ban user controller :",error.message);
        res.status(500).json({error: "Internal server error"});       
    }
}
//to do :add ban with time and reason,add unban user functionality
export const unbanUser = async (req , res) =>{
    const { id:userId } = req.params;
    try {
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        // verify if it's an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to ban users" });
        }
        
        const user = await User.findOne({_id :userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isBanned = false; 
        await user.save();
        res.status(200).json({ message: "User unbanned successfully" });
    } catch (error) {
        console.log("Error in unban user controller :",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
//get banned users
export const getBnnedUsers = async (req,res) =>{
    try {
        if (req.user.isAdmin === false) {
            return res.status(403).json({error: "You are not authorized to view banned users"});
        }
        const bannedUsers = await User.find({isBanned:true}).select("-password");
        res.status(200).json(bannedUsers);

    } catch (error) {
        console.log("Error in get banned users controller :", error.message);
        res.status(500).json({ error: "Internal server error" });           
    }
    }