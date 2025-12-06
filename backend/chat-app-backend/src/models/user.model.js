import mongoose  from "mongoose";

// UPDATED to match Next.js User schema with additional chat features
const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim: true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase: true,
            trim: true
        },
        password:{
            type:String,
            required:true,
            minlength:6,
            select: false  // Don't return password by default
        },
        role:{
            type:String,
            enum: ['mother', 'doctor'],
            required:true,
            default:'mother'
        },
        profilePic:{
            type:String,
            default:"",
        },
        isOnline:{
            type:Boolean,
            default:false
        },
        isBanned:{
            type:Boolean,
            default:false
        }
    },
    { timestamps:true}
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ isBanned: 1 });

const User = mongoose.model("User",userSchema);

export default User ;