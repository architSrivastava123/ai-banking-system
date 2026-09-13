# Cards and UPI Integration FAQs

## Are debit and credit cards supported?
Virtual debit card credentials linked directly to your primary INR account can be generated inside the dashboard. Card authorizations execute a synchronous reservation on your ledger balance.

## Does the system support UPI payments?
Yes, UPI handles (e.g., `username@bank`) can be mapped directly to your primary Account ID. When a peer transfers money via UPI, the system resolves the handle to the corresponding MongoDB Account ID and records the incoming transaction.

## What is System Funding?
System Funding is an administrative operation performed by a designated `systemUser`. It injects capital into new user accounts for initial deposit testing and seed capital. System funding transactions are executed through `/api/transaction/system/initiate-funding` and debited from the bank's core treasury reserves.
