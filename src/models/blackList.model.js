const mongoose=require("mongoose");

const blackListSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is required for blacklisting"],
        unique:true,
    }
},{
    timestamps:true
})

 blackListSchema.index(
    {created_at:1},
    {expireAfterSeconds:60*60*24*3, } //3days
)

const tokenBlackListModel=mongoose.model("tokenBlackList",blackListSchema);

module.exports=tokenBlackListModel;