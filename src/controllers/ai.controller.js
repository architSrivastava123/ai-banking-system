const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'ai-banking-internal-secret-key';

// Helper to make requests to Python AI Service
async function callAiService(endpoint, method = 'GET', body = null) {
    const url = `${AI_SERVICE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': INTERNAL_SECRET
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
    } catch (error) {
        console.error(`Error connecting to Python AI service at ${url}:`, error.message);
        return {
            ok: false,
            status: 503,
            data: {
                message: 'AI Service is currently unavailable. Please ensure the Python AI service is running on port 8000.',
                error: error.message
            }
        };
    }
}

// POST /api/ai/chat
async function chat(req, res) {
    try {
        const { message, conversationId } = req.body;
        if (!message) {
            return res.status(422).json({ message: 'Message is required' });
        }

        const user = req.user;
        const payload = {
            message,
            conversation_id: conversationId || null,
            user_id: user._id.toString(),
            user_name: user.username,
            user_email: user.email
        };

        const result = await callAiService('/api/chat', 'POST', payload);
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('AI chat error:', error);
        return res.status(500).json({ message: 'Internal server error processing AI chat' });
    }
}

// POST /api/ai/rag/query
async function ragQuery(req, res) {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(422).json({ message: 'Query is required' });
        }

        const result = await callAiService('/api/rag/query', 'POST', { query });
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('RAG query error:', error);
        return res.status(500).json({ message: 'Internal server error processing RAG query' });
    }
}

// GET /api/ai/insights
async function getInsights(req, res) {
    try {
        const user = req.user;
        const result = await callAiService(`/api/insights?user_id=${user._id.toString()}&user_name=${encodeURIComponent(user.username)}`);
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('AI insights error:', error);
        return res.status(500).json({ message: 'Internal server error fetching insights' });
    }
}

// GET /api/ai/spending-summary
async function getSpendingSummary(req, res) {
    try {
        const user = req.user;
        const result = await callAiService(`/api/spending-summary?user_id=${user._id.toString()}`);
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('AI spending summary error:', error);
        return res.status(500).json({ message: 'Internal server error fetching spending summary' });
    }
}

// POST /api/ai/categorize
async function categorize(req, res) {
    try {
        const { description, amount, recipient } = req.body;
        const result = await callAiService('/api/categorize', 'POST', {
            description: description || '',
            amount: parseFloat(amount) || 0,
            recipient: recipient || ''
        });
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('AI categorize error:', error);
        return res.status(500).json({ message: 'Internal server error categorizing transaction' });
    }
}

module.exports = {
    chat,
    ragQuery,
    getInsights,
    getSpendingSummary,
    categorize
};
