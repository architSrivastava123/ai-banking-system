# Security and Privacy Policy

## 1. Data Protection and Encryption
- All network traffic is encrypted in transit using TLS 1.3.
- User passwords are encrypted at rest using `bcrypt` salted password hashing with work factor 10.
- JSON Web Tokens (JWT) are cryptographically signed with HMAC-SHA256 and stored inside secure HTTP-only cookies to mitigate Cross-Site Scripting (XSS) risks.

## 2. Token Blacklisting and Invalidation
When a user logs out, their active JWT signature is written to a specialized `tokenBlackList` store in MongoDB with an automated Time-To-Live (TTL) index expiring in 3 days. Any subsequent API request bearing a blacklisted token is denied with HTTP 401 Unauthorized.

## 3. Privacy & AI Safeguards
- The AI Layer processes user transaction history strictly within an ephemeral LangGraph state execution pipeline.
- Sensitive credentials (such as user passwords and raw JWT tokens) are excluded from LLM prompt contexts and logging utilities.
- Vector database embeddings contain only authorized institutional policy documents, FAQs, and public knowledge base articles; private user balances and transaction records are never stored in the vector store.
