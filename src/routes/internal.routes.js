const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internal.controller');

// Secure all internal routes with the shared secret middleware
router.use(internalController.verifyInternalSecret);

router.get('/users/:userId/accounts', internalController.getUserAccounts);
router.get('/accounts/:accountId/balance', internalController.getAccountBalance);
router.get('/users/:userId/transactions', internalController.getUserTransactions);
router.get('/users/:userId/spending-summary', internalController.getUserLedgerSummary);

module.exports = router;
