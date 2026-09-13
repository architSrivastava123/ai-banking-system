# Transaction Reversal and Dispute Policy

## 1. Ground Rules for Reversals
Because ledger entries are mathematically immutable, direct deletion or database rollback of confirmed records is prohibited. Reversals are executed strictly through **Compensating Transactions**:
- A reversal initiates a brand-new transaction with status `REVERSED`.
- The reversed transaction creates a compensating `CREDIT` back to the sender's account and an offsetting `DEBIT` from the destination account.

## 2. Dispute Filing Timelines
Users have up to **30 calendar days** from the transaction timestamp to file an official dispute regarding unauthorized charges, merchant non-delivery, or duplicate debit records.

## 3. Investigation and Provisional Credit
- Disputes undergo algorithmic review within 2 business days.
- If fraudulent activity or technical server failure (such as network timeout mid-session) is verified, a provisional credit refund is processed to the affected account within 24 hours.
