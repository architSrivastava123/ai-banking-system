const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');
const aiRouter = require('./routes/ai.routes');
const internalRouter = require('./routes/internal.routes');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-secret']
}));

app.use(express.json());
app.use(cookieParser());

// Public & Authenticated Client Routes
app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/ai', aiRouter);

// Internal secure routes for Python AI Service
app.use('/api/internal', internalRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'banking-gateway', time: new Date() });
});

module.exports = app;