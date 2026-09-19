// In-memory store providing high-fidelity fallback when local MongoDB is not running.
const bcrypt = require('bcrypt');

const memoryStore = {
    users: [],
    accounts: [],
    ledgers: [],
    transactions: [],
    blacklists: []
};

// Seed a default demo account with funds so immediate testing works seamlessly
async function seedDemoData() {
    const demoPassword = await bcrypt.hash('password123', 10);
    const demoUserId = '660f00000000000000000001';
    const demoAccountId = '660f000000000000000000aa';

    const defaultUser = {
        _id: demoUserId,
        username: 'archit',
        email: 'archit@example.com',
        password: demoPassword,
        systemUser: false,
        createdAt: new Date()
    };

    const defaultAccount = {
        _id: demoAccountId,
        user: demoUserId,
        status: 'ACTIVE',
        currency: 'INR',
        createdAt: new Date(),
        getBalance: function() {
            let credit = 0, debit = 0;
            for (const l of memoryStore.ledgers) {
                if (l.account === demoAccountId) {
                    if (l.type === 'CREDIT') credit += l.amount;
                    else if (l.type === 'DEBIT') debit += l.amount;
                }
            }
            return credit - debit;
        }
    };

    memoryStore.users.push(defaultUser);
    memoryStore.accounts.push(defaultAccount);

    // Initial deposit ledger entry: ₹50,000.00
    memoryStore.ledgers.push({
        _id: '660f00000000000000000001',
        account: demoAccountId,
        type: 'CREDIT',
        amount: 50000,
        transaction: '660f000000000000000000tx1',
        createdAt: new Date()
    });

    // Sample expense: ₹1,200.00 Swiggy
    memoryStore.ledgers.push({
        _id: '660f00000000000000000002',
        account: demoAccountId,
        type: 'DEBIT',
        amount: 1200,
        transaction: '660f000000000000000000tx2',
        createdAt: new Date()
    });

    memoryStore.transactions.push({
        _id: '660f000000000000000000tx1',
        fromAccount: null,
        toAccount: demoAccountId,
        amount: 50000,
        status: 'COMPLETED',
        idempotencyKey: 'seed_init_funding',
        createdAt: new Date(Date.now() - 86400000 * 2)
    });

    memoryStore.transactions.push({
        _id: '660f000000000000000000tx2',
        fromAccount: demoAccountId,
        toAccount: '660f000000000000000000bb',
        amount: 1200,
        status: 'COMPLETED',
        idempotencyKey: 'seed_order_swiggy',
        createdAt: new Date(Date.now() - 86400000)
    });
}

seedDemoData();

module.exports = memoryStore;
