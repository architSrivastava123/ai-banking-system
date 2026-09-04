const transactionModel=require("../models/transaction.model")
const ledgerModel=require("../models/ledger.models")
const accountModel=require('../models/account.model')
const emailService=require("../services/email.service")
const mongoose=require('mongoose')

async function createTransaction(req,res){
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(422).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required",
        })
    }
 
    // -validate user accounts
    if(fromAccount===toAccount){
        return res.status(422).json({
            message:"fromAccount and toAccount cannot be same",
        })
    }
    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount,
    })
    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(422).json({
            message:"fromAccount or toAccount does not exist",
        })
    }

    // -validate idempotency key
    const isTransactionExist=await transactionModel.findOne({
        idempotencyKey,
    })
    if(isTransactionExist){
        if(isTransactionExist.status==="COMPLETED"){
            return res.status(422).json({
                message:"transaction already completed",
            })
        }
        if(isTransactionExist.status==="PENDING"){
            return res.status(422).json({
                message:"transaction is already in progress",
            })
        }   
        if(isTransactionExist.status==="FAILED"){
            return res.status(422).json({
                message:"transaction failed, please try again",
            })
        }
        if(isTransactionExist.status==="REVERSED"){
            return res.status(422).json({
                message:"transaction is reversed, please try again",
            })
        }
    }

    //-validate account status
    if(fromUserAccount.status!=="ACTIVE" || toUserAccount.status!=="ACTIVE"){
        return res.status(422).json({
            message:"fromAccount or toAccount is not active",
        })
    }

    //-derive sender balance from ledger
    const senderAmount=await fromUserAccount.getBalance();

    if(senderAmount<amount){
        return res.status(400).json({
            message:`insufficient balance. current balance is ${senderAmount} and requested amount is ${amount}`
        })
    }

    //-create transaction
    const session=await mongoose.startSession();
    session.startTransaction();
    const transaction=(await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0] 
    const debitLedgerEntry=await ledgerModel.create([{
        account:fromAccount,
        type:"DEBIT",
        amount,
        transaction:transaction._id
    }],{session})
    const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        type:"CREDIT",
        amount,
        transaction:transaction._id
    }],{session})
    await transactionModel.findOneAndUpdate({_id:transaction._id},{status:"COMPLETED"},{session})
    await session.commitTransaction();
    session.endSession();

    await emailService.sendTransactionMail(req.user.username, req.user.email, amount, fromAccount, toAccount);
    return res.status(201).json({
        message:"transaction completed successfully",
        transaction,
    })
}

async function initiateFunding(req,res){
    // Implementation for initiating funding
    const {toAccount,amount,idempotencyKey}=req.body;
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(422).json({
            message:"toAccount, amount and idempotencyKey are required",
        })
    }

    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    }) 
    if(!toUserAccount){
        return res.status(422).json({
            message:"toAccount does not exist",
        })
    }
    const fromUserAccount=await accountModel.findOne({
        user:req.user._id
    })
    if(!fromUserAccount){
        return res.status(422).json({
            message:"system account does not exist",
        })
    }

    const session=await mongoose.startSession();
    session.startTransaction();
    const transaction=new transactionModel({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    })

    const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccount._id,
        type:"DEBIT",
        amount,
        transaction:transaction._id
    }],{session})
    const creditLedgerEntry=await ledgerModel.create([{
        account:toUserAccount._id,
        type:"CREDIT",
        amount,
        transaction:transaction._id
    }],{session})
    transaction.status="COMPLETED";
    await transaction.save({session})
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message:"initiate funding transaction completed successfully",
        transaction,
    })
}

module.exports={createTransaction,initiateFunding}
