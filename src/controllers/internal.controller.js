const accountModel = require('../models/account.model');
const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.models');
const userModel = require('../models/user.model');

// Middleware to verify internal secret
function verifyInternalSecret(req, res, next) {
    const internalSecret = req.headers['x-internal-secret'] || req.headers['authorization'];
    const expectedSecret = process.env.INTERNAL_SERVICE_SECRET || 'ai-banking-internal-secret-key';
    
    if (!internalSecret || (internalSecret !== expectedSecret && internalSecret !== `Bearer ${expectedSecret}`)) {
        return res.status(403).json({
            message: 'Forbidden: Invalid internal service secret'
        });
    }
    next();
}

// Get user accounts with current calculated balance
async function getUserAccounts(req, res) {
    try {
        const { userId } = req.params;
        const accounts = await accountModel.find({ user: userId });
        
        const accountsWithBalance = await Promise.all(
            accounts.map(async (acc) => {
                const balance = await acc.getBalance();
                return {
                    id: acc._id.toString(),
                    user: acc.user.toString(),
                    status: acc.status,
                    currency: acc.currency,
                    balance: balance,
                    createdAt: acc.createdAt
                };
            })
        );

        return res.status(200).json({
            success: true,
            accounts: accountsWithBalance
        });
    } catch (error) {
        console.error('Error fetching internal accounts:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get specific account balance
async function getAccountBalance(req, res) {
    try {
        const { accountId } = req.params;
        const account = await accountModel.findById(accountId);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        const balance = await account.getBalance();
        return res.status(200).json({
            success: true,
            accountId: account._id.toString(),
            balance,
            status: account.status,
            currency: account.currency
        });
    } catch (error) {
        console.error('Error fetching internal balance:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get user transactions
async function getUserTransactions(req, res) {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit, 10) || 20;
        const minAmount = parseFloat(req.query.minAmount) || 0;

        const accounts = await accountModel.find({ user: userId });
        const accountIds = accounts.map(a => a._id);

        if (accountIds.length === 0) {
            return res.status(200).json({ success: true, transactions: [] });
        }

        const query = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        };

        if (minAmount > 0) {
            query.amount = { $gte: minAmount };
        }

        const transactions = await transactionModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Annotate transaction with direction for the user
        const accountIdSet = new Set(accountIds.map(id => id.toString()));
        const enrichedTransactions = transactions.map(tx => {
            const isDebit = accountIdSet.has(tx.fromAccount?.toString());
            const isCredit = accountIdSet.has(tx.toAccount?.toString());
            let type = "TRANSFER";
            if (isDebit && !isCredit) type = "DEBIT";
            else if (!isDebit && isCredit) type = "CREDIT";
            else if (isDebit && isCredit) type = "INTERNAL_TRANSFER";

            return {
                id: tx._id.toString(),
                fromAccount: tx.fromAccount ? tx.fromAccount.toString() : null,
                toAccount: tx.toAccount ? tx.toAccount.toString() : null,
                amount: tx.amount,
                status: tx.status,
                type,
                idempotencyKey: tx.idempotencyKey,
                date: tx.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            transactions: enrichedTransactions
        });
    } catch (error) {
        console.error('Error fetching internal transactions:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get complete ledger analytics for user
async function getUserLedgerSummary(req, res) {
    try {
        const { userId } = req.params;
        const accounts = await accountModel.find({ user: userId });
        const accountIds = accounts.map(a => a._id);

        if (accountIds.length === 0) {
            return res.status(200).json({
                success: true,
                summary: {
                    totalBalance: 0,
                    totalCredit: 0,
                    totalDebit: 0,
                    transactionCount: 0,
                    accountsCount: 0
                }
            });
        }

        const ledgerEntries = await ledgerModel.find({
            account: { $in: accountIds }
        }).sort({ createdAt: -1 }).lean();

        let totalCredit = 0;
        let totalDebit = 0;

        for (const entry of ledgerEntries) {
            if (entry.type === 'CREDIT') {
                totalCredit += entry.amount;
            } else if (entry.type === 'DEBIT') {
                totalDebit += entry.amount;
            }
        }

        return res.status(200).json({
            success: true,
            summary: {
                totalBalance: totalCredit - totalDebit,
                totalCredit,
                totalDebit,
                transactionCount: ledgerEntries.length,
                accountsCount: accounts.length
            }
        });
    } catch (error) {
        console.error('Error fetching ledger summary:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    verifyInternalSecret,
    getUserAccounts,
    getAccountBalance,
    getUserTransactions,
    getUserLedgerSummary
};
