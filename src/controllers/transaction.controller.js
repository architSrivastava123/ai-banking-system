const mongoose = require('mongoose');
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.models");
const accountModel = require('../models/account.model');
const emailService = require("../services/email.service");
const memoryStore = require('../config/memoryStore');

async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(422).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required",
        });
    }

    if (fromAccount === toAccount) {
        return res.status(422).json({
            message: "fromAccount and toAccount cannot be same",
        });
    }

    // 1. Real MongoDB flow
    if (mongoose.connection.readyState === 1) {
        const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
        const toUserAccount = await accountModel.findOne({ _id: toAccount });
        if (!fromUserAccount || !toUserAccount) {
            return res.status(422).json({ message: "fromAccount or toAccount does not exist" });
        }

        const isTransactionExist = await transactionModel.findOne({ idempotencyKey });
        if (isTransactionExist) {
            return res.status(422).json({ message: `transaction already ${isTransactionExist.status.toLowerCase()}` });
        }

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(422).json({ message: "fromAccount or toAccount is not active" });
        }

        const senderAmount = await fromUserAccount.getBalance();
        if (senderAmount < amount) {
            return res.status(400).json({
                message: `insufficient balance. current balance is ${senderAmount} and requested amount is ${amount}`
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        const transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        await ledgerModel.create([{
            account: fromAccount,
            type: "DEBIT",
            amount,
            transaction: transaction._id
        }], { session });

        await ledgerModel.create([{
            account: toAccount,
            type: "CREDIT",
            amount,
            transaction: transaction._id
        }], { session });

        await transactionModel.findOneAndUpdate({ _id: transaction._id }, { status: "COMPLETED" }, { session });
        await session.commitTransaction();
        session.endSession();

        try {
            await emailService.sendTransactionMail(req.user.username, req.user.email, amount, fromAccount, toAccount);
        } catch (e) {}

        return res.status(201).json({
            message: "transaction completed successfully",
            transaction,
        });
    }

    // 2. Offline / In-Memory Demo Fallback
    const fromAcc = memoryStore.accounts.find(a => a._id === fromAccount);
    const balance = fromAcc ? fromAcc.getBalance() : 50000;
    if (balance < amount) {
        return res.status(400).json({
            message: `insufficient balance. current balance is ₹${balance} and requested amount is ₹${amount}`
        });
    }

    const txId = `tx_${Date.now()}`;
    const newTx = {
        _id: txId,
        fromAccount,
        toAccount,
        amount,
        status: "COMPLETED",
        idempotencyKey,
        createdAt: new Date()
    };
    memoryStore.transactions.unshift(newTx);

    // Append DEBIT & CREDIT entries
    memoryStore.ledgers.push({
        _id: `leg_deb_${Date.now()}`,
        account: fromAccount,
        type: "DEBIT",
        amount,
        transaction: txId,
        createdAt: new Date()
    });

    memoryStore.ledgers.push({
        _id: `leg_cred_${Date.now()}`,
        account: toAccount,
        type: "CREDIT",
        amount,
        transaction: txId,
        createdAt: new Date()
    });

    return res.status(201).json({
        message: "transaction completed successfully",
        transaction: newTx
    });
}

async function initiateFunding(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(422).json({
            message: "toAccount, amount and idempotencyKey are required",
        });
    }

    if (mongoose.connection.readyState === 1) {
        const toUserAccount = await accountModel.findOne({ _id: toAccount });
        if (!toUserAccount) {
            return res.status(422).json({ message: "toAccount does not exist" });
        }
        const fromUserAccount = await accountModel.findOne({ user: req.user._id });
        if (!fromUserAccount) {
            return res.status(422).json({ message: "system account does not exist" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        const transaction = (await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0];

        await ledgerModel.create([{
            account: fromUserAccount._id,
            type: "DEBIT",
            amount,
            transaction: transaction._id
        }], { session });

        await ledgerModel.create([{
            account: toUserAccount._id,
            type: "CREDIT",
            amount,
            transaction: transaction._id
        }], { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "initiate funding transaction completed successfully",
            transaction,
        });
    }

    // In-memory funding
    const txId = `tx_fund_${Date.now()}`;
    const newTx = {
        _id: txId,
        fromAccount: 'system_treasury',
        toAccount,
        amount,
        status: "COMPLETED",
        idempotencyKey,
        createdAt: new Date()
    };
    memoryStore.transactions.unshift(newTx);
    memoryStore.ledgers.push({
        _id: `leg_cred_${Date.now()}`,
        account: toAccount,
        type: "CREDIT",
        amount,
        transaction: txId,
        createdAt: new Date()
    });

    return res.status(201).json({
        message: "initiate funding transaction completed successfully",
        transaction: newTx
    });
}

module.exports = { createTransaction, initiateFunding };
