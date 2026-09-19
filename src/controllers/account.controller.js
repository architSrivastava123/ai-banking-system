const mongoose = require('mongoose');
const accountModel = require('../models/account.model');
const memoryStore = require('../config/memoryStore');

async function createAccount(req, res) {
    try {
        const user = req.user;
        if (mongoose.connection.readyState === 1) {
            const account = await accountModel.create({ user: user._id });
            return res.status(201).json({ account });
        }

        const newAccountId = `acc_${Date.now()}`;
        const newAcc = {
            _id: newAccountId,
            user: user._id,
            status: "ACTIVE",
            currency: "INR",
            createdAt: new Date(),
            getBalance: function() {
                let credit = 0, debit = 0;
                for (const l of memoryStore.ledgers) {
                    if (l.account === newAccountId) {
                        if (l.type === 'CREDIT') credit += l.amount;
                        else if (l.type === 'DEBIT') debit += l.amount;
                    }
                }
                return credit - debit;
            }
        };
        memoryStore.accounts.push(newAcc);
        return res.status(201).json({ account: newAcc });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function getUserAccount(req, res) {
    try {
        const user = req.user;
        if (mongoose.connection.readyState === 1) {
            const accounts = await accountModel.findOne({ user: user._id });
            return res.status(200).json({ accounts });
        }

        let account = memoryStore.accounts.find(a => a.user === user._id);
        if (!account && memoryStore.accounts.length > 0) {
            account = memoryStore.accounts[0]; // fallback to primary demo account
        }
        return res.status(200).json({ accounts: account });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function getAccountBalance(req, res) {
    try {
        const { accountId } = req.params;
        if (mongoose.connection.readyState === 1) {
            const account = await accountModel.findOne({
                _id: accountId,
                user: req.user._id,
            });
            if (!account) {
                return res.status(404).json({ message: "account not found" });
            }
            const balance = await account.getBalance();
            return res.status(200).json({ balance });
        }

        const account = memoryStore.accounts.find(a => a._id === accountId);
        const balance = account ? account.getBalance() : 50000;
        return res.status(200).json({ balance });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { createAccount, getUserAccount, getAccountBalance };