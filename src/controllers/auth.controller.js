const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const emailService=require('../services/email.service')
const tokenBlackListModel=require('../models/blackList.model')

async function registerUser(req,res){
    const {username,email,password}=req.body;
    const isUser=await userModel.findOne({
        email
    });
    if(isUser){
        return res.status(422).json({
            message:"Invalid Email",
        })
    }
    const user=await userModel.create({
        username, email, password
    })

    const token=jwt.sign({
        userId:user._id,
    },process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token);

    res.status(201).json({
        user,
    })

    await emailService.sendRegisterMail(username,email);
}

async function loginUser(req,res){
    const {email,password}=req.body;
    const user=await userModel.findOne({
        email,
    }).select("password")
    if(!user){
        return res.status(422).json({
            message:"Invalid email or password",
        })
    }
    const passwordVerification=await user.comparePassword(password);
    if(!passwordVerification){
        return res.status(422).json({
            message:"invalid email or password",
        })
    }
    const token=jwt.sign({
        userId:user._id,
    },process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)

    res.status(200).json({
        msg:"user logged in successfully",
        user
    })
}

async function logoutUser(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message:"No token found",
        })
    }
    const isBlacklisted = await tokenBlackListModel.findOne({ token });
    if(isBlacklisted){
        return res.status(401).json({
            message:"user already logged out",
        })
    }
    await tokenBlackListModel.create({
        token
    })
    res.clearCookie("token");
    res.status(200).json({
        message:"user logged out successfully",
    })
}

module.exports={registerUser,loginUser,logoutUser}