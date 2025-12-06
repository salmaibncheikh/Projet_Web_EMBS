import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utilis.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, password, email } = req.body;

    try {
        // Validate input
        if (!fullName || !email || !password) {
            return res.status(400).json ({message: "All fields are required"});
        }
        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: "Email already used, try another one!" });
        }
        //validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Your password must be at least 6 characters" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed_pwd = await bcrypt.hash(password, salt);
        // Add user to db
        const newUser = new User({
            fullName,
            email,
            password: hashed_pwd
        });
        await newUser.save();
        // Generate jwt token
        generateToken(newUser._id, res);
        // Respond with user data
        // Note: profilePic is optional, so it may not be present in the user object
        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic
        });
    } catch (error) {
        // Handle duplicate key error (E11000)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ error: "Email already used, try another one!" });
        }
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const login = async (req, res) => {
    //fetch email and password from request body
    const {  email,password  } = req.body;
    
    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required " });
        }
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }
        if (user.isBanned){
            return res.status(403).json({error : "You are banned from using this application!"});
        }
        //check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }
        user.isOnline = true; // set user as online
        await user.save(); // Save online status to database
        
        generateToken(user._id,res) 
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            isOnline: user.isOnline,
            isAdmin: user.isAdmin,
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        // Set user as offline in database
        await User.findByIdAndUpdate(userId, { isOnline: false });
        
        // Clear the cookie by setting its maxAge to 0
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log(`Error while logging out : ${error.message}`);
        res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const { profilePic } = req.body;
        const userId = req.user._id ;
        
        if (!profilePic){
            return res.status(400).json({message:"Profile picutre is required"});

        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        console.log("Upload response:", uploadResponse);
        await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        },{new:true})
        res.status(200).json({
            message: "Profile updated successfully",
            profilePic: uploadResponse.secure_url
        });
    } catch (error) {
        console.log("Error in updateProfile controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }


}

export const checkAuth = async (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}