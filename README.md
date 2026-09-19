# 💳 AI-Powered Smart Banking System

A state-of-the-art, secure, and intelligent Banking System that fuses an established **Node.js/Express double-entry ledger backend** with an enterprise-grade **Python AI layer (LangChain, LangGraph, RAG, Chroma Vector DB, and FastAPI)** and a modern **React dashboard**.

---

## 🏛️ High-Level System Architecture

```
                                  +--------------------------------------------------+
                                  |                  React Frontend                  |
                                  |    (Dashboard, AI Chat Assistant, Analytics)     |
                                  +------------------------+-------------------------+
                                                           |
                                                           | HTTP (JWT Cookie / Auth Bearer)
                                                           v
                                  +--------------------------------------------------+
                                  |      Node.js / Express Core Banking Gateway      |
                                  |                    (Port 3000)                   |
                                  |                                                  |
                                  |  - Authentication & JWT Token Blacklist (TTL)    |
                                  |  - Double-Entry Ledger (Immutable CREDIT/DEBIT)  |
                                  |  - ACID Multi-Document Transactions              |
                                  |  - Authenticated AI Proxy: /api/ai/*             |
                                  |  - Internal Read-Only Gateway: /api/internal/*   |
                                  +------------+--------------------+----------------+
                                               |                    |
                           MongoDB Mongoose    |                    | HTTP (X-Internal-Secret)
                                               v                    v
                  +--------------------------------+   +-----------------------------------------------+
                  |            MongoDB             |   |           Python AI Microservice              |
                  |                                |   |                 (Port 8000)                   |
                  |  - Users & Accounts            |   |                                               |
                  |  - Transactions (Idempotency)  |   |  - FastAPI Gateway                            |
                  |  - Append-Only Ledger Entries  |   |  - LangGraph StateGraph (4 Workflow Branches) |
                  |  - Token Blacklist (TTL 3 days)|   |  - LangChain Read-Only Banking Tools          |
                  +--------------------------------+   |  - RAG Pipeline (Chroma Vector DB)            |
                                                       |  - Deterministic Financial Math & Anomalies   |
                                                       |  - Configurable LLM (Gemini / OpenAI / Mock)  |
                                                       +-----------------------+-----------------------+
                                                                               |
                                                                               v
                                                               +-------------------------------+
                                                               |     Chroma Vector Database    |
                                                               |  - Banking Policies & Limits  |
                                                               |  - Reversal & Dispute Guides  |
                                                               |  - FAQ & Terms of Service     |
                                                               +-------------------------------+
```

---

## 🚀 Key Features

### 1. Core Banking & Ledger Accounting (Node.js + MongoDB)
- **Double-Entry Ledger Bookkeeping**: Balances are never updated via naive counters. Instead, real-time balance is derived dynamically from append-only immutable ledger records:
  $$\text{Balance} = \sum \text{CREDIT} - \sum \text{DEBIT}$$
- **Ledger Immutability**: Strict Mongoose hooks intercept and throw errors on any `update`, `delete`, or `remove` calls against the ledger.
- **ACID Transactions**: Money transfers run inside MongoDB multi-document sessions with automatic rollback upon any failure.
- **Idempotency Protection**: Every transaction enforces a client-supplied `idempotencyKey` with a unique database index to prevent duplicate transfers or double billing.
- **JWT Authentication & Token Blacklisting**: Secure cookie and Bearer token parsing paired with a MongoDB TTL collection (`expireAfterSeconds: 3 days`) for immediate logout invalidation.

### 2. Python AI Service (LangChain + LangGraph + RAG + FastAPI)
- **LangGraph StateGraph Workflow**:
  - `classify_intent`: Routes user inquiries to Banking Tools, RAG Search, Spending Analytics, or General conversational fallback.
  - `retrieve_banking_data`: Executes authorized read-only banking tools.
  - `retrieve_documents`: Queries Chroma vector database for grounded policy chunks.
  - `analyze_transactions`: Runs deterministic financial math and anomaly detection heuristics.
  - `generate_response`: Grounds responses using LangChain templates.
  - `validate_response`: Guardrail node enforcing factual consistency and citation requirements.
- **Read-Only Banking Tools**:
  - `get_account_balance`: Real-time ledger-verified balance.
  - `get_account_details`: All accounts, statuses, and currencies for the user.
  - `get_recent_transactions`: Recent transfer records with limit and direction markers.
  - `get_transaction_history`: High-value query filter (e.g., transactions above ₹5,000).
  - `get_monthly_spending`: Aggregate inflows, outflows, and net savings.
  - `get_spending_by_category`: Breakdown across Food, Shopping, Transport, Utilities, etc.
- **Grounded RAG Pipeline**:
  - Documents stored across `knowledge/banking-faq/`, `knowledge/policies/`, and `knowledge/terms/`.
  - Splitting via `RecursiveCharacterTextSplitter` preserving source, document title, and chunk metadata.
  - Vector similarity search via Chroma.
  - Generates grounded responses with **explicit source citations**; explicitly declines to invent missing policy facts.
- **Deterministic Analytics & Anomaly Detection**:
  - Financial calculations (income, expenses, savings rate) are calculated 100% in code, eliminating LLM arithmetic hallucinations.
  - Heuristic categorization (Swiggy $\rightarrow$ Food, Uber $\rightarrow$ Transport, Amazon $\rightarrow$ Shopping).
  - Flags outlier transfers ($> 3\times$ average) and abnormal single amounts ($> ₹25,000$).

### 3. Luxury Dark-Mode React Frontend
- **Real-Time Overview Cards**: Account Balance, Monthly Inflow, Monthly Outflow, Net Savings Rate.
- **AI Banking Assistant**: Interactive chat interface with quick suggestion pills, intent indicators, execution latency, and citation cards.
- **Spending Analytics Tab**: Visual category spending progress bars, income vs. expense ratios, and anomaly alert notifications.
- **Ledger Activity Table**: Live debit/credit indicators, timestamps, and account details.
- **Transfer Money Modal**: Form with automatic UUID idempotency key generation and balance validation.

---

## 📂 Project Structure

```
├── server.js                        # Node.js backend entrypoint (Port 3000)
├── package.json                     # Node.js dependencies (Express, Mongoose, JWT, CORS)
├── src/
│   ├── app.js                       # Express configuration & middleware
│   ├── config/db.js                 # MongoDB connection
│   ├── models/
│   │   ├── user.model.js            # User schema with bcrypt password hashing
│   │   ├── account.model.js         # Account schema with getBalance() aggregation
│   │   ├── ledger.models.js         # Immutable append-only ledger model
│   │   ├── transaction.model.js     # Transaction schema with idempotency key
│   │   └── blackList.model.js       # JWT blacklist with 3-day TTL index
│   ├── middleware/
│   │   └── auth.middleware.js       # Regular and System auth guards
│   ├── routes/
│   │   ├── auth.routes.js           # Register, Login, Logout
│   │   ├── account.routes.js        # Create account, get balance
│   │   ├── transaction.routes.js    # Transfers, system funding
│   │   ├── ai.routes.js             # Authenticated AI client proxy routes
│   │   └── internal.routes.js       # Shared-secret read-only routes for Python
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── account.controller.js
│   │   ├── transaction.controller.js
│   │   ├── ai.controller.js
│   │   └── internal.controller.js
│   └── services/
│       └── email.service.js         # Nodemailer email dispatch
│
├── ai-service/                      # Python FastAPI AI Microservice (Port 8000)
│   ├── requirements.txt             # LangChain, LangGraph, Chroma, FastAPI
│   ├── .env.example / .env          # AI service environment configuration
│   ├── scripts/
│   │   └── ingest_documents.py      # Knowledge ingestion into Chroma DB
│   ├── knowledge/                   # RAG knowledge documents
│   │   ├── banking-faq/             # general_faq.md, transfer_faq.md, cards_upi_faq.md
│   │   ├── policies/                # transaction_policy.md, account_policy.md, reversal_dispute_policy.md
│   │   └── terms/                   # terms_of_service.md, security_privacy_policy.md
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint
│   │   ├── config/settings.py       # Pydantic settings
│   │   ├── utils/                   # Sanitized logger and custom exceptions
│   │   ├── services/
│   │   │   ├── llm_factory.py       # Factory for Gemini, OpenAI, or Mock fallback
│   │   │   ├── banking_service.py   # HTTP client to Node.js /api/internal/*
│   │   │   └── analytics_service.py # Deterministic math, categorization, anomalies
│   │   ├── tools/                   # LangChain read-only banking tools
│   │   ├── rag/                     # Loader, Splitter, Embeddings, Chroma Vectorstore, Retriever
│   │   ├── graph/                   # LangGraph State, Nodes, and compiled StateGraph
│   │   └── api/                     # FastAPI routes (/api/chat, /api/rag, /api/insights, /api/categorize)
│   └── tests/                       # Pytest test suite
│
└── frontend/                        # React + Vite Frontend (Port 5173)
    ├── index.html                   # HTML template with Outfit & Inter typography
    ├── vite.config.js               # Vite config with /api reverse proxy to Node.js
    └── src/
        ├── index.css                # Luxury dark-mode design system & glassmorphism
        ├── App.jsx                  # Main state management and tab navigation
        └── components/
            ├── Navbar.jsx
            ├── DashboardOverview.jsx
            ├── AiAssistant.jsx
            ├── SpendingAnalytics.jsx
            ├── TransactionsList.jsx
            ├── TransferModal.jsx
            └── AuthModal.jsx
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- Python 3.11+
- MongoDB instance running locally or on MongoDB Atlas (Replica Set required for ACID transactions)

---

### Step 1: Start the Node.js Express Backend

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/banking_system
   JWT_SECRET=your_super_secret_jwt_key
   INTERNAL_SERVICE_SECRET=ai-banking-internal-secret-key
   AI_SERVICE_URL=http://localhost:8000
   EMAIL_USER=test@bank.com
   ```
3. Start the backend:
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

---

### Step 2: Start the Python AI Service

1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` in `ai-service/`:
   ```env
   PORT=8000
   HOST=0.0.0.0
   NODE_BACKEND_URL=http://localhost:3000
   INTERNAL_SERVICE_SECRET=ai-banking-internal-secret-key
   LLM_PROVIDER=gemini # or 'openai' or 'mock'
   GOOGLE_API_KEY=your_google_api_key_here # optional (falls back to mock if blank)
   CHROMA_PERSIST_DIRECTORY=./data/chroma_db
   ```
5. Ingest knowledge documents into Chroma Vector DB:
   ```bash
   python scripts/ingest_documents.py
   ```
6. Run the FastAPI AI service:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### Step 3: Start the React Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   # Access UI at http://localhost:5173
   ```

---

## 🧪 Running Automated Tests

Run the comprehensive pytest suite covering banking tools, RAG retrieval, LangGraph routing, and FastAPI endpoints:

```bash
cd ai-service
python -m pytest tests/ -v
```

---

## 📋 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer & set cookie | Public |
| `POST` | `/api/auth/login` | Login customer & verify credentials | Public |
| `POST` | `/api/auth/logout` | Invalidate token (adds to blacklist) | Cookie / Bearer |

### 2. Banking Operations (`/api/account` & `/api/transaction`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/create-account` | Open new bank account | Required |
| `GET` | `/api/account/get-account` | Fetch active user accounts | Required |
| `GET` | `/api/account/get-account-balance/:id` | Real-time ledger balance | Required |
| `POST` | `/api/transaction/create-transaction` | Transfer money with idempotency | Required |
| `POST` | `/api/transaction/system/initiate-funding` | Seed account with initial funds | System User |

### 3. AI Smart Services (`/api/ai`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Conversational LangGraph Assistant | Required |
| `POST` | `/api/ai/rag/query` | Grounded Policy/FAQ search with sources | Required |
| `GET` | `/api/ai/insights` | Deterministic metrics + LLM explanation | Required |
| `GET` | `/api/ai/spending-summary` | Monthly spending breakdown | Required |
| `POST` | `/api/ai/categorize` | Merchant categorization & anomaly flag | Required |

---

## 💬 Example Natural Language Queries

- **Balance Inquiry**: `"How much money is in my account?"`
  - *Action*: LangGraph routes to `banking_tool` $\rightarrow$ `get_account_balance`.
  - *Response*: `"Hello John, your verified current balance for account 660f... is ₹50,000.00 INR."`
- **Policy Query**: `"Why can a bank transfer fail?"`
  - *Action*: LangGraph routes to `rag_search` $\rightarrow$ Chroma Vector DB $\rightarrow$ grounded answer with sources.
  - *Citations*: `[transfer_faq.md, transaction_policy.md]`.
- **Spending Inquiry**: `"How much did I spend this month?"`
  - *Action*: LangGraph routes to `spending_analytics` $\rightarrow$ deterministic breakdown of total expenses, top category, and savings.
- **Filtered Inquiry**: `"Show transactions above ₹5000."`
  - *Action*: Extracts `min_amount = 5000` structured filter and retrieves matching ledger records.

---

## 🎓 Senior Software & AI Engineer Interview Q&A

### 1. Why LangChain?
> **Answer**: LangChain provides an abstraction layer for prompt management, document loaders, text splitters, vector store retrieval, tool calling schemas, and model interoperability. It enables swapping LLM providers (e.g., from Gemini to OpenAI) by changing a single configuration key without altering application business logic.

### 2. Why LangGraph over standard linear chains?
> **Answer**: Financial workflows are non-linear, multi-step state machines requiring dynamic decision-making. A standard linear chain or single agent often hallucinates routing decisions. With LangGraph, we define an explicit, typed `StateGraph(BankingState)` with deterministic conditional edges (`classify_intent` $\rightarrow$ `retrieve_banking_data` | `retrieve_documents` | `analyze_transactions`) and validation guardrails (`validate_response` $\rightarrow$ `END`). This ensures deterministic routing, fault recovery, and cyclical human-in-the-loop workflows if needed.

### 3. Why RAG instead of fine-tuning?
> **Answer**: Fine-tuning embeds information into model weights, which is expensive, prone to hallucinations, lacks source verification, and quickly becomes obsolete when policies change. RAG grounds the model in the latest verified institutional documents (policies, limits, dispute procedures) at query time. It allows instant knowledge base updates (via `ingest_documents.py`) and returns auditable source citations (`document`, `category`, `source`) without modifying model weights.

### 4. Why a separate Python AI service instead of rewriting Node.js in Python?
> **Answer**: This follows the **Microservices Strangler Fig Pattern** and separation of concerns:
> 1. The existing Node.js core is optimized for high-throughput, low-latency I/O, user session management, and ACID ledger writes.
> 2. The AI/ML ecosystem (LangChain, LangGraph, Chroma, NumPy) is native to Python.
> 3. Running AI in a separate microservice ensures heavy LLM requests, embedding computations, or vector queries never block the Node.js event loop or compromise core financial transaction availability.

### 5. How does the AI access banking data, and how do you prevent direct database modifications?
> **Answer**: Security is enforced through **Read-Only API Gateways**:
> - The AI tools (`get_account_balance`, `get_recent_transactions`) interact with Node.js exclusively via internal HTTP endpoints (`/api/internal/*`) protected by an `x-internal-secret`.
> - The AI service has **no write access** to MongoDB.
> - Transaction actions (`create-transaction`) are never exposed as tools to the LLM. Transfers require direct, authenticated user action on standard banking forms with multi-factor validation and idempotency tokens.

### 6. How does authentication work between Express and Python?
> **Answer**: The Node.js gateway validates the user's JWT cookie/header and checks it against the `tokenBlackList` model. Once authenticated, Express injects the verified customer identity (`userId`, `userEmail`, `userName`) into the payload sent to Python, accompanied by a cryptographically secure `x-internal-secret` header. The Python AI service never accepts an unauthenticated user ID directly from client requests.

### 7. How do you prevent financial calculation hallucinations?
> **Answer**: **Code and database are the single source of truth for all numbers**. In `analytics_service.py`, mathematical indicators (total income, expenses, net savings, percentages) are calculated using deterministic Python arithmetic over database records. The LLM is only utilized to provide natural language coaching and summaries based on the computed values, never to compute financial totals.

### 8. How do you protect user financial privacy in the RAG vector store?
> **Answer**: The vector database contains **institutional knowledge only** (public FAQs, transaction caps, legal terms, reversal policies). Customer account balances, names, and transaction histories are **never embedded into the vector store**. Customer data exists solely in MongoDB and is queried in memory during active tool execution within ephemeral LangGraph state variables.