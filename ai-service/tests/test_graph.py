import pytest
from app.graph.nodes import classify_intent
from app.graph.banking_graph import route_by_intent
from app.graph.state import BankingState

@pytest.mark.asyncio
async def test_classify_banking_query():
    state: BankingState = {
        "user_id": "test_user_1",
        "user_name": "Alice",
        "user_email": "alice@bank.com",
        "query": "How much money is in my account?",
        "intent": "general",
        "tool_name": None,
        "tool_args": None,
        "tool_result": None,
        "retrieved_documents": [],
        "analysis": None,
        "response": "",
        "sources": [],
        "validation_status": "valid",
        "anomalies": None
    }
    result = await classify_intent(state)
    assert result["intent"] == "banking_tool"
    assert result["tool_name"] == "get_account_balance"

@pytest.mark.asyncio
async def test_classify_rag_policy_query():
    state: BankingState = {
        "user_id": "test_user_1",
        "user_name": "Alice",
        "user_email": "alice@bank.com",
        "query": "Why can a bank transfer fail?",
        "intent": "general",
        "tool_name": None,
        "tool_args": None,
        "tool_result": None,
        "retrieved_documents": [],
        "analysis": None,
        "response": "",
        "sources": [],
        "validation_status": "valid",
        "anomalies": None
    }
    result = await classify_intent(state)
    assert result["intent"] == "rag_search"

@pytest.mark.asyncio
async def test_classify_spending_query():
    state: BankingState = {
        "user_id": "test_user_1",
        "user_name": "Alice",
        "user_email": "alice@bank.com",
        "query": "How much did I spend this month on food?",
        "intent": "general",
        "tool_name": None,
        "tool_args": None,
        "tool_result": None,
        "retrieved_documents": [],
        "analysis": None,
        "response": "",
        "sources": [],
        "validation_status": "valid",
        "anomalies": None
    }
    result = await classify_intent(state)
    assert result["intent"] == "spending_analytics"

def test_graph_routing_decision():
    assert route_by_intent({"intent": "banking_tool"}) == "retrieve_banking_data"
    assert route_by_intent({"intent": "rag_search"}) == "retrieve_documents"
    assert route_by_intent({"intent": "spending_analytics"}) == "analyze_transactions"
    assert route_by_intent({"intent": "general"}) == "generate_response"
