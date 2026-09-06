const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

// All client-facing AI routes require user authentication
router.use(authMiddleware.authMiddleware);

router.post('/chat', aiController.chat);
router.post('/rag/query', aiController.ragQuery);
router.get('/insights', aiController.getInsights);
router.get('/spending-summary', aiController.getSpendingSummary);
router.post('/categorize', aiController.categorize);

module.exports = router;
