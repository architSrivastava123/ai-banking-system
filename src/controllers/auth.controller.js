const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');
const tokenBlackListModel = require('../models/blackList.model');
const emailService = require('../services/email.service');
const memoryStore = require('../config/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-ai-banking';

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ message: "Email and password are required" });
        }

        // 1. Real MongoDB flow
        if (mongoose.connection.readyState === 1) {
            const isUser = await userModel.findOne({ email });
            if (isUser) {
                return res.status(422).json({ message: "Email already in use" });
            }
            const user = await userModel.create({
                username: username || email.split('@')[0],
                email,
                password
            });

            const token = jwt.sign({
                userId: user._id,
                username: user.username,
                email: user.email
            }, JWT_SECRET, { expiresIn: "3d" });

            res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
            res.status(201).json({ user, token });

            try {
                await emailService.sendRegisterMail(user.username, user.email);
            } catch (e) {
                // non-blocking
            }
            return;
        }

        // 2. Offline / In-Memory Demo Fallback
        const existing = memoryStore.users.find(u => u.email === email.toLowerCase());
        if (existing) {
            return res.status(422).json({ message: "Email already in use" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const newUser = {
            _id: `user_${Date.now()}`,
            username: username || email.split('@')[0],
            email: email.toLowerCase(),
            password: hashed,
            createdAt: new Date()
        };
        memoryStore.users.push(newUser);

        // Auto-create initial account with seed balance for instant testing
        const newAccountId = `acc_${Date.now()}`;
        memoryStore.accounts.push({
            _id: newAccountId,
            user: newUser._id,
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
        });

        // Seed initial balance ₹25,000
        memoryStore.ledgers.push({
            _id: `leg_${Date.now()}`,
            account: newAccountId,
            type: "CREDIT",
            amount: 25000,
            transaction: `tx_welcome_${Date.now()}`,
            createdAt: new Date()
        });

        const token = jwt.sign({
            userId: newUser._id,
            username: newUser.username,
            email: newUser.email
        }, JWT_SECRET, { expiresIn: "3d" });

        res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
        return res.status(201).json({ user: newUser, token });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(422).json({ message: "Email and password are required" });
        }

        // 1. Real MongoDB flow
        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findOne({ email }).select("+password");
            if (!user) {
                return res.status(422).json({ message: "Invalid email or password" });
            }
            const passwordVerification = await user.comparePassword(password);
            if (!passwordVerification) {
                return res.status(422).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign({
                userId: user._id,
                username: user.username,
                email: user.email
            }, JWT_SECRET, { expiresIn: "3d" });

            res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
            return res.status(200).json({
                msg: "user logged in successfully",
                user: { _id: user._id, username: user.username, email: user.email },
                token
            });
        }

        // 2. Offline / In-Memory Demo Fallback
        let user = memoryStore.users.find(u => u.email === email.toLowerCase());
        if (!user) {
            // Auto-provision demo user so login works seamlessly for user
            const hashed = await bcrypt.hash(password, 10);
            user = {
                _id: `user_${Date.now()}`,
                username: email.split('@')[0],
                email: email.toLowerCase(),
                password: hashed,
                createdAt: new Date()
            };
            memoryStore.users.push(user);

            // Auto-create account with ₹50,000 balance
            const newAccountId = `acc_${Date.now()}`;
            memoryStore.accounts.push({
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
            });
            memoryStore.ledgers.push({
                _id: `leg_${Date.now()}`,
                account: newAccountId,
                type: "CREDIT",
                amount: 50000,
                transaction: `tx_init_${Date.now()}`,
                createdAt: new Date()
            });
        } else {
            const passwordVerification = await bcrypt.compare(password, user.password);
            if (!passwordVerification) {
                return res.status(422).json({ message: "Invalid email or password" });
            }
        }

        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            email: user.email
        }, JWT_SECRET, { expiresIn: "3d" });

        res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });
        return res.status(200).json({
            msg: "user logged in successfully",
            user: { _id: user._id, username: user.username, email: user.email },
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function logoutUser(req, res) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token found" });
    }

    if (mongoose.connection.readyState === 1) {
        const isBlacklisted = await tokenBlackListModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "user already logged out" });
        }
        await tokenBlackListModel.create({ token });
    } else {
        memoryStore.blacklists.push(token);
    }

    res.clearCookie("token");
    return res.status(200).json({ message: "user logged out successfully" });
}

module.exports = { registerUser, loginUser, logoutUser };