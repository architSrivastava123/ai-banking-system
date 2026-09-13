# General Banking FAQs

## What is Smart Banking?
Smart Banking is an AI-powered financial service that integrates real-time double-entry ledger accounting, automated transaction categorization, proactive anomaly detection, and natural language conversational banking to provide users with transparent and secure control over their finances.

## How do I open a bank account?
To open an account:
1. Register on the portal with your email and password.
2. Complete verification.
3. Once logged in, use the "Create Account" option in your dashboard.
4. Your account will immediately be assigned a unique Account ID with initial status set to ACTIVE in INR currency.

## What account statuses exist?
An account can have one of three statuses:
- **ACTIVE**: Fully functional for both incoming credits and outgoing debits.
- **FROZEN**: Account cannot initiate debits (transfers out) due to security verification, administrative review, or user request. Credits may still be received.
- **CLOSED**: The account is permanently terminated. No debits or credits are permitted.

## How is my account balance calculated?
Unlike legacy banking systems that mutate a static balance number, this banking system calculates your balance dynamically using an immutable double-entry ledger.
Your live balance is computed as:
$$\text{Balance} = \sum \text{CREDIT Entries} - \sum \text{DEBIT Entries}$$
Every completed transaction produces both a credit and debit ledger record, ensuring 100% mathematical integrity and auditability.

## Can I hold multiple accounts?
Yes. A registered user can create multiple secondary accounts (e.g., for savings, business, or personal budgeting) under the same user profile. Each account maintains its own independent ledger history and balance.
