import mongoose  from "mongoose";
const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        fullName:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true,
            minlength:6
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
        },
        isAdmin:{
            type:Boolean,
            default:false   
        }
    },
    { timestamps:true}
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ isBanned: 1 });

const User = mongoose.model("User",userSchema);

export default User ;