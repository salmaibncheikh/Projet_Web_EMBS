import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utilis.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { name, password, email, role } = req.body;

    try {
        console.log('Signup request:', { name, email, hasPassword: !!password, role });
        console.log('Password type:', typeof password);
        console.log('Password value:', password);
        console.log('Full request body:', req.body);
        
        // Validate input
        if (!name || !email || !password) {
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
        // Validate role
        if (role && !['mother', 'doctor'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'mother' or 'doctor'" });
        }
        
        // Hash password
        console.log('About to hash password...');
        const salt = await bcrypt.genSalt(10);
        console.log('Salt generated:', salt);
        const hashed_pwd = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');
        
        // Add user to db
        const newUser = new User({
            name,
            email,
            password: hashed_pwd,
            role: role || 'mother'  // Default to mother if not specified
        });
        console.log('About to save user...');
        await newUser.save();
        console.log('User saved successfully');
        
        // Generate jwt token
        generateToken(newUser._id, res);
        console.log('Token generated');
        
        // Respond with user data
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profilePic: newUser.profilePic
        });
    } catch (error) {
        // Handle duplicate key error (E11000)
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ error: "Email already used, try another one!" });
        }
        console.log("Error in signup controller", error.message);
        console.log("Full error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
}

export const login = async (req, res) => {
    //fetch email and password from request body
    const {  email,password  } = req.body;
    
    try {
        console.log('Login request:', { email, hasPassword: !!password });
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required " });
        }
        
        console.log('Finding user...');
        // Check if user exists - IMPORTANT: include password field explicitly
        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', user ? { id: user._id, email: user.email, role: user.role, hasPassword: !!user.password } : 'NOT FOUND');
        
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }
        if (user.isBanned){
            return res.status(403).json({error : "You are banned from using this application!"});
        }
        
        console.log('Comparing password...');
        //check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials!" });
        }
        
        console.log('Setting user online...');
        user.isOnline = true; // set user as online
        await user.save(); // Save online status to database
        
        console.log('Generating token...');
        generateToken(user._id,res)
        
        console.log('Login successful, sending response');
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            isOnline: user.isOnline
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        console.log("Full login error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
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