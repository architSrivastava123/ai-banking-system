const jwt=require('jsonwebtoken')
const userModel=require('../models/user.model')
const tokenBlackListModel=require('../models/blackList.model')

async function authMiddleware(req,res,next){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message:"create account first",
        })
    }
    const isTokenBlackListed=await tokenBlackListModel.findOne({
        token
    })
    if(isTokenBlackListed){
        return res.status(401).json({
            message:"unauthorised access! invalid user"
        })
    }
    try{
        const isValid=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await userModel.findById(isValid.userId);
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({
            message:"unauthorised access! invalid user"
        })
    }
}

async function systemAuthMiddleware(req,res,next){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message:"create account first",
        })
    }
    const isTokenBlackListed=await tokenBlackListModel.findOne({
        token
    })
    if(isTokenBlackListed){
        return res.status(401).json({
            message:"unauthorised access! invalid user"
        })
    }
    try{
        const isValid=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(isValid.userId).select("+systemUser");
        if(!user || !user.systemUser){
            return res.status(403).json({
                message:"forbidden access! not a system user"
            })
        }
        req.user=user;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({
            message:"unauthorised access! invalid user"
        })
    }
}

module.exports={authMiddleware,systemAuthMiddleware}