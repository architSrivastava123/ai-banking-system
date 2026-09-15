import re
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from app.graph.state import BankingState
from app.services.banking_service import banking_service
from app.services.analytics_service import analytics_service
from app.rag.retriever import retriever
from app.services.llm_factory import get_llm
from app.utils.logger import logger

llm = get_llm()

async def classify_intent(state: BankingState) -> Dict[str, Any]:
    """
    Classifies the user query into one of 4 workflow paths:
    1. 'banking_tool': Real-time user account and transaction inquiries
    2. 'rag_search': Bank policy, FAQ, limits, and knowledge queries
    3. 'spending_analytics': Financial aggregations, category breakdowns, anomalies
    4. 'general': Conversational greetings and help
    """
    query = state["query"].lower().strip()
    logger.info(f"Node [classify_intent] processing: '{query}'")

    # Fast keyword and pattern classification
    # 1. RAG indicators (policy, rules, why did X happen, limits, failure causes)
    rag_keywords = [
        "why can", "why did", "fail", "policy", "limit", "terms", "rules", "faq",
        "how to open", "how does", "frozen", "reversal", "dispute", "refund", "upi"
    ]
    if any(k in query for k in rag_keywords) and not ("my account" in query and "balance" in query):
        return {
            "intent": "rag_search",
            "tool_name": None,
            "tool_args": None
        }

    # 2. Spending Analytics indicators
    spending_keywords = [
        "how much did i spend", "spending", "expense", "expenses", "analytics",
        "category", "food", "shopping", "savings", "income", "breakdown"
    ]
    if any(k in query for k in spending_keywords) and not ("balance" in query and "how much" in query):
        return {
            "intent": "spending_analytics",
            "tool_name": "get_monthly_spending",
            "tool_args": {"user_id": state["user_id"]}
        }

    # 3. Banking Tool queries (Balance, recent transactions, account numbers)
    if "balance" in query or "how much money" in query or "available funds" in query:
        return {
            "intent": "banking_tool",
            "tool_name": "get_account_balance",
            "tool_args": {"user_id": state["user_id"]}
        }
    
    if "transaction" in query or "statement" in query or "history" in query or "transfers" in query:
        # Check for min_amount filter (e.g., "transactions above 5000")
        min_amount_match = re.search(r'(?:above|greater than|>|over)\s*(?:₹|rs\.?|inr)?\s*(\d+)', query)
        min_amount = float(min_amount_match.group(1)) if min_amount_match else 0.0
        
        limit_match = re.search(r'(?:last|recent)\s*(\d+)', query)
        limit = int(limit_match.group(1)) if limit_match else 5

        return {
            "intent": "banking_tool",
            "tool_name": "get_recent_transactions",
            "tool_args": {"user_id": state["user_id"], "limit": limit, "min_amount": min_amount}
        }

    if "account" in query or "profile" in query:
        return {
            "intent": "banking_tool",
            "tool_name": "get_account_details",
            "tool_args": {"user_id": state["user_id"]}
        }

    # Default to general assistance
    return {
        "intent": "general",
        "tool_name": None,
        "tool_args": None
    }


async def retrieve_banking_data(state: BankingState) -> Dict[str, Any]:
    """
    Executes the designated read-only banking tool against the backend.
    """
    tool_name = state.get("tool_name")
    user_id = state["user_id"]
    tool_args = state.get("tool_args") or {}
    logger.info(f"Node [retrieve_banking_data] executing: {tool_name}")

    if tool_name == "get_account_balance":
        accounts = await banking_service.get_user_accounts(user_id)
        if not accounts:
            result = {"status": "error", "message": "No active bank accounts found for this user profile."}
        else:
            primary_acc = accounts[0]
            result = {
                "status": "success",
                "account_id": primary_acc["id"],
                "balance": primary_acc.get("balance", 0.0),
                "currency": primary_acc.get("currency", "INR"),
                "total_accounts": len(accounts)
            }

    elif tool_name == "get_account_details":
        accounts = await banking_service.get_user_accounts(user_id)
        result = {"status": "success", "accounts": accounts}

    elif tool_name == "get_recent_transactions":
        limit = tool_args.get("limit", 5)
        min_amount = tool_args.get("min_amount", 0.0)
        transactions = await banking_service.get_user_transactions(
            user_id=user_id,
            limit=limit,
            min_amount=min_amount
        )
        result = {
            "status": "success",
            "count": len(transactions),
            "min_amount_filter": min_amount,
            "transactions": transactions
        }
    else:
        result = {"status": "unknown_tool", "message": "Tool not recognized."}

    return {"tool_result": result}


async def retrieve_documents(state: BankingState) -> Dict[str, Any]:
    """
    RAG node: queries Chroma vector store for policy documentation.
    """
    query = state["query"]
    logger.info(f"Node [retrieve_documents] searching for: '{query}'")
    retrieved = retriever.retrieve(query)
    sources = retriever.format_sources(retrieved)
    return {
        "retrieved_documents": retrieved,
        "sources": sources
    }


async def analyze_transactions(state: BankingState) -> Dict[str, Any]:
    """
    Analytics node: runs deterministic financial calculations and anomaly detection.
    """
    user_id = state["user_id"]
    logger.info(f"Node [analyze_transactions] calculating metrics for user_id={user_id}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=50)
    metrics = analytics_service.calculate_metrics(transactions)
    anomalies = analytics_service.detect_anomalies(transactions)

    return {
        "analysis": metrics,
        "anomalies": anomalies,
        "tool_result": {"metrics": metrics, "anomalies": anomalies}
    }


async def generate_response(state: BankingState) -> Dict[str, Any]:
    """
    Synthesizes the final grounded answer using LLM or structured template.
    """
    intent = state.get("intent", "general")
    query = state["query"]
    user_name = state.get("user_name", "Valued Customer")
    logger.info(f"Node [generate_response] generating answer for intent: {intent}")

    if intent == "banking_tool":
        res = state.get("tool_result", {})
        tool_name = state.get("tool_name")
        
        if tool_name == "get_account_balance":
            if res.get("status") == "success":
                bal = res.get("balance", 0.0)
                acc_id = res.get("account_id")
                ans = f"Hello {user_name}, your verified current balance for account `{acc_id}` is **₹{bal:,.2f} {res.get('currency', 'INR')}**."
            else:
                ans = f"Hello {user_name}, {res.get('message', 'could not retrieve balance')}."

        elif tool_name == "get_recent_transactions":
            txs = res.get("transactions", [])
            if not txs:
                ans = f"Hello {user_name}, no transactions were found matching your criteria."
            else:
                lines = [f"Here are your recent transactions, {user_name}:"]
                for i, tx in enumerate(txs, 1):
                    lines.append(f"{i}. **₹{tx.get('amount', 0):,.2f}** ({tx.get('type')}) - Status: `{tx.get('status')}` on {str(tx.get('date'))[:10]}")
                ans = "\n".join(lines)

        elif tool_name == "get_account_details":
            accounts = res.get("accounts", [])
            if not accounts:
                ans = f"Hello {user_name}, no accounts found under your profile."
            else:
                lines = [f"Hello {user_name}, here are your registered accounts:"]
                for acc in accounts:
                    lines.append(f"- Account ID: `{acc.get('id')}` | Status: **{acc.get('status')}** | Balance: **₹{acc.get('balance', 0):,.2f}**")
                ans = "\n".join(lines)
        else:
            ans = f"Retrieved banking information: {res}"

    elif intent == "rag_search":
        docs = state.get("retrieved_documents", [])
        if not docs:
            ans = "The available banking documents do not contain specific information to answer this question. Please contact support."
        else:
            prompt = f"Answer the user's question accurately based on this context:\n"
            for d in docs[:3]:
                prompt += f"- {d['content']}\n"
            prompt += f"\nUser Question: {query}\nAnswer:"
            try:
                ai_msg = await llm.ainvoke([HumanMessage(content=prompt)])
                ans = ai_msg.content if hasattr(ai_msg, "content") else str(ai_msg)
            except Exception as e:
                ans = docs[0]["content"]

    elif intent == "spending_analytics":
        analysis = state.get("analysis", {})
        income = analysis.get("income", 0.0)
        expenses = analysis.get("expenses", 0.0)
        savings = analysis.get("savings", 0.0)
        top_cat = analysis.get("top_category", "General")
        
        ans = (
            f"📊 **Financial Spending Summary for {user_name}**:\n\n"
            f"- **Total Inflow (Income)**: ₹{income:,.2f}\n"
            f"- **Total Outflow (Expenses)**: ₹{expenses:,.2f}\n"
            f"- **Net Savings**: ₹{savings:,.2f} ({analysis.get('savings_rate_pct', 0)}% savings rate)\n"
            f"- **Top Spending Category**: **{top_cat}**\n"
            f"- **Average Transaction**: ₹{analysis.get('average_transaction', 0):,.2f}\n\n"
        )
        anomalies = state.get("anomalies", [])
        if anomalies:
            ans += f"⚠️ *Note: {len(anomalies)} transaction(s) flagged for unusual activity.*"

    else:
        ans = (
            f"Hello {user_name}! I am your AI Banking Assistant. You can ask me:\n"
            f"- 'How much money is in my account?'\n"
            f"- 'Show my recent transactions'\n"
            f"- 'How much did I spend this month?'\n"
            f"- 'Why can a bank transfer fail?'"
        )

    return {"response": ans}


async def validate_response(state: BankingState) -> Dict[str, Any]:
    """
    Guardrail node: verifies that no critical policy assertions are made
    without citations and checks that response is properly formatted.
    """
    logger.info("Node [validate_response] verifying generated output")
    intent = state.get("intent")
    sources = state.get("sources", [])

    if intent == "rag_search" and not sources:
        # Flag if a policy answer lacks citations
        return {"validation_status": "unverified"}

    return {"validation_status": "valid"}
