import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
      email:{
        type:String
    },
    mobile:{
        type:String,
    },
    electionid:{
        type:String,
        required:true,
        unique:true
    },
    
    password:{
        type:String,
        required:true
    },
    isVoted:{
        type:Boolean,
        default:false
    },
    isMFA:{
        type:Boolean,
        required:false,
    },
    twoFactorSecret:{
        type:String
    },
    role: {
        type: String,
        enum: ['admin', 'voter'], // Add your allowed roles here
        default:'voter',
        required: true
    },
    profileImage: {
        type: String // stores the filename of the uploaded image
    },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }

},
{timestamps:true});

userSchema.pre('save',async function(next){
    const user=this;
    if(!user.isModified('password')) return next();
    try {
        const salt=await bcrypt.genSalt(10);
        const hashedpassword=await bcrypt.hash(user.password,salt);
        user.password=hashedpassword;
        next();
    } catch (error) {
        return next(error);
    }
})
userSchema.methods.comparePassword=async function(candidatePassword){
    try {
        const isMatch=await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model('User', userSchema);

export default User;
