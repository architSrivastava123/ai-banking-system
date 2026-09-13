# Money Transfer FAQs

## How do money transfers work?
When you initiate a money transfer between two accounts:
1. The system verifies that both sender and recipient accounts are active.
2. The sender's current balance is derived from the immutable ledger to ensure sufficient funds.
3. An ACID transaction session is initiated.
4. The transaction record is registered in `PENDING` state with a unique `idempotencyKey`.
5. A `DEBIT` ledger entry is appended to the sender's account.
6. A `CREDIT` ledger entry is appended to the recipient's account.
7. The transaction status transitions to `COMPLETED`, and an email notification is dispatched.

## What is an Idempotency Key?
An idempotency key is a unique client-generated string attached to each transfer request. If a network disruption occurs and you retry sending money, the server recognizes the idempotency key and prevents executing the transfer twice. This guarantees that you are never double-charged.

## Why can a bank transfer fail?
A bank transfer can fail due to several distinct reasons:
1. **Insufficient Balance**: The sender account's derived ledger balance is lower than the transfer amount requested.
2. **Account Inactive or Frozen**: Either the source account or destination account has a status of `FROZEN` or `CLOSED`.
3. **Same Account Transfer**: The `fromAccount` and `toAccount` specified are identical. Transfers must occur between distinct accounts.
4. **Invalid Account Identifiers**: Either the sending account ID or receiving account ID does not exist in the bank's directory.
5. **Duplicate Idempotency Key**: An identical idempotency key was previously submitted for a transaction that already completed or is currently processing.
6. **System Database Lock or Network Timeout**: A concurrency conflict or network partition caused the MongoDB ACID session to abort and roll back.

## How long do internal transfers take to reflect?
Internal transfers between accounts in our system are real-time and settle instantaneously via ACID ledger entries.
