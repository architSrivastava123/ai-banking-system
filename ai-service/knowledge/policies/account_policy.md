# Bank Account Management Policy

## 1. Account Eligibility and Verification
All prospective customers must provide a valid email address and secure password (minimum 6 characters) upon registration. Passwords are irreversibly hashed with bcrypt (salt cost factor 10) prior to storage.

## 2. Account Lifecycle States
1. **ACTIVE**:
   - Authorized for all credit and debit activities.
   - May initiate internal transfers and receive system fundings.
2. **FROZEN**:
   - Initiated when suspicious anomalies are flagged by security systems, when KYC compliance is overdue, or at the explicit request of the account owner.
   - Outbound debits are blocked (`fromAccount is not active`).
   - Incoming deposits are accepted.
3. **CLOSED**:
   - Accounts can only be closed once their ledger balance is exactly zero.
   - Closed accounts cannot participate in any transaction.
   - Historical transaction logs and ledger entries are archived for regulatory audit trails for a mandatory duration of 7 years.

## 3. Currencies Supported
The default base operating currency is Indian Rupee (INR). Secondary multicurrency accounts (USD, EUR) are subject to real-time currency conversion exchange rates and spread fees.
