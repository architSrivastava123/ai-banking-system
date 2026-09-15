from typing import TypedDict, Optional, List, Dict, Any

class BankingState(TypedDict):
    """
    Typed state container for the LangGraph AI Banking Workflow.
    Preserves context throughout intent classification, tool routing,
    RAG retrieval, analytics calculations, and response generation.
    """
    user_id: str
    user_name: str
    user_email: Optional[str]
    query: str
    intent: str  # "banking_tool" | "rag_search" | "spending_analytics" | "general"
    tool_name: Optional[str]
    tool_args: Optional[Dict[str, Any]]
    tool_result: Optional[Dict[str, Any]]
    retrieved_documents: List[Dict[str, Any]]
    analysis: Optional[Dict[str, Any]]
    response: str
    sources: List[Dict[str, Any]]
    validation_status: str  # "valid" | "flagged"
    anomalies: Optional[List[Dict[str, Any]]]
