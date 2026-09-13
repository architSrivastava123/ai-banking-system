# Banking Transaction Policy

## 1. Scope & Execution Principles
Every monetary exchange within the platform is governed by this Transaction Policy. All transactions adhere to strict ACID (Atomicity, Consistency, Isolation, Durability) guarantees powered by database sessions and double-entry ledger bookkeeping.

## 2. Minimum and Maximum Transaction Limits
- **Minimum Transaction**: The minimum allowable transfer amount is ₹1.00. Transactions with zero or negative amounts will be rejected with an HTTP 422 Unprocessable Entity error.
- **Daily Standard Limit**: Standard accounts are permitted up to ₹100,000 per 24-hour rolling window.
- **Single Transaction Limit**: The default single transfer cap for regular personal accounts is ₹50,000. Higher limits require administrative authorization.

## 3. Immutability of Financial Records
Once committed to the database, ledger records (`CREDIT` and `DEBIT`) cannot be updated, rewritten, or deleted. Any modification attempt triggers an immediate exception:
`Ledger entries are immutable and cannot be modified or deleted`.
Any operational discrepancy must be resolved by generating an offsetting compensatory transaction rather than altering past ledger rows.

## 4. Idempotency Guarantee
Clients MUST transmit a unique `idempotencyKey` with every fund transfer. 
- If a transaction is submitted with an existing completed key, the server rejects the request with HTTP 422 (`transaction already completed`) without double-charging.
- If the previous transaction failed, the user may retry with a newly generated idempotency key.

## 5. Anomaly Detection and Security Holds
Automated AI monitoring evaluates transaction patterns in real-time. Transactions exceeding three times the user's historical median, rapid high-frequency transfers within 60 seconds, or transfers flagged by anomaly detection heuristics may be placed into temporary `PENDING` review status for manual inspection.
