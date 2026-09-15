from langgraph.graph import StateGraph, END
from app.graph.state import BankingState
from app.graph.nodes import (
    classify_intent,
    retrieve_banking_data,
    retrieve_documents,
    analyze_transactions,
    generate_response,
    validate_response
)
from app.utils.logger import logger

def route_by_intent(state: BankingState) -> str:
    """
    Conditional router directing execution along the appropriate branch
    based on the classified user intent.
    """
    intent = state.get("intent", "general")
    logger.info(f"Routing LangGraph execution for intent: '{intent}'")
    if intent == "banking_tool":
        return "retrieve_banking_data"
    elif intent == "rag_search":
        return "retrieve_documents"
    elif intent == "spending_analytics":
        return "analyze_transactions"
    else:
        return "generate_response"

def build_banking_graph():
    """
    Constructs and compiles the AI Banking Workflow StateGraph.
    """
    workflow = StateGraph(BankingState)

    # Register Nodes
    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("retrieve_banking_data", retrieve_banking_data)
    workflow.add_node("retrieve_documents", retrieve_documents)
    workflow.add_node("analyze_transactions", analyze_transactions)
    workflow.add_node("generate_response", generate_response)
    workflow.add_node("validate_response", validate_response)

    # Set Entrypoint
    workflow.set_entry_point("classify_intent")

    # Conditional Branching from intent classification
    workflow.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {
            "retrieve_banking_data": "retrieve_banking_data",
            "retrieve_documents": "retrieve_documents",
            "analyze_transactions": "analyze_transactions",
            "generate_response": "generate_response"
        }
    )

    # Join branches to response generation
    workflow.add_edge("retrieve_banking_data", "generate_response")
    workflow.add_edge("retrieve_documents", "generate_response")
    workflow.add_edge("analyze_transactions", "generate_response")

    # Pass through validation guardrails to END
    workflow.add_edge("generate_response", "validate_response")
    workflow.add_edge("validate_response", END)

    compiled_graph = workflow.compile()
    logger.info("Compiled LangGraph Banking Workflow successfully.")
    return compiled_graph

banking_graph = build_banking_graph()
