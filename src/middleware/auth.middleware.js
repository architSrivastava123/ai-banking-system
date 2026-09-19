const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const tokenBlackListModel = require('../models/blackList.model');
const memoryStore = require('../config/memoryStore');

async function authMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please sign in or register first."
        });
    }

    // Check blacklist
    if (mongoose.connection.readyState === 1) {
        const isBlacklisted = await tokenBlackListModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: "unauthorised access! invalid user" });
        }
    } else {
        if (memoryStore.blacklists.includes(token)) {
            return res.status(401).json({ message: "unauthorised access! invalid user" });
        }
    }

    try {
        const isValid = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-for-ai-banking');
        if (mongoose.connection.readyState === 1) {
            req.user = await userModel.findById(isValid.userId);
        } else {
            req.user = memoryStore.users.find(u => u._id === isValid.userId) || {
                _id: isValid.userId,
                username: isValid.username || 'archit',
                email: isValid.email || 'archit@example.com'
            };
        }

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            message: "unauthorised access! invalid user"
        });
    }
}

async function systemAuthMiddleware(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const isValid = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-for-ai-banking');
        if (mongoose.connection.readyState === 1) {
            const user = await userModel.findById(isValid.userId).select("+systemUser");
            if (!user || !user.systemUser) {
                return res.status(403).json({ message: "forbidden access! not a system user" });
            }
            req.user = user;
        } else {
            req.user = { _id: isValid.userId, username: 'system', systemUser: true };
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: "unauthorised access! invalid user" });
    }
}

module.exports = { authMiddleware, systemAuthMiddleware };