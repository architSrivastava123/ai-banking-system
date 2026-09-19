const mongoose = require('mongoose');

async function connectDB() {
    // Disable command buffering so operations don't freeze the server when DB is offline
    mongoose.set('bufferCommands', false);

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('localhost:27017')) {
        console.log('ℹ️ Operating in High-Fidelity In-Memory Demo Mode.');
        console.log('ℹ️ Instant login/registration, ledger balances, transfers, and AI assistant are fully active!');
        console.log('ℹ️ (Optional: set a live MongoDB Atlas URI in .env for persistent cloud storage)');
        return;
    }

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.warn('⚠️ MongoDB connection warning:', error.message);
    }
}

module.exports = connectDB;