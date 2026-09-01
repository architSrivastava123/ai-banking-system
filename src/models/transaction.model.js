const mongoose=require('mongoose')

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associated with an account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associated with an account"],
        index:true
    },
    amount:{
        type:Number,
        required:[true,"amount is required to send money"],
        min:[1,"amount is required to be greater than 0"],
    },
    status:{
        type:String,
        enum:{
            values:["COMPLETED","FAILED","PENDING","REVERSED"],
            message:"status can be either COMPLETED, FAILED, PENDING OR REVERSED"
        },
        default:"PENDING"
    },
    idempotencyKey:{
        type:String,
        required:[true,"idempotency key is required for transaction"],
        unique:true,
        index:true
    }
},{
    timestamps:true
})

const transactionModel=mongoose.model("transaction",transactionSchema);
module.exports=transactionModel