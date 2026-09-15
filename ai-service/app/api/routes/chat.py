import time
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.api.deps import verify_internal_secret
from app.graph.banking_graph import banking_graph
from app.graph.state import BankingState
from app.utils.logger import logger

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or command in natural language")
    conversation_id: Optional[str] = Field(None, description="Optional conversation session ID")
    user_id: str = Field(..., description="Authenticated user ID supplied by Node.js gateway")
    user_name: Optional[str] = Field("Valued Customer", description="User display name")
    user_email: Optional[str] = Field(None, description="User verified email")

class ChatResponse(BaseModel):
    response: str
    intent: str
    tool_used: Optional[str] = None
    tool_result: Optional[Dict[str, Any]] = None
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    anomalies: Optional[List[Dict[str, Any]]] = None
    latency_ms: float

@router.post("", response_model=ChatResponse, dependencies=[Depends(verify_internal_secret)])
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    logger.info(f"AI Chat received request from user={request.user_id}: '{request.message}'")

    initial_state: BankingState = {
        "user_id": request.user_id,
        "user_name": request.user_name or "Customer",
        "user_email": request.user_email,
        "query": request.message,
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

    try:
        final_state = await banking_graph.ainvoke(initial_state)
        latency = round((time.time() - start_time) * 1000, 2)
        logger.info(f"LangGraph completed in {latency}ms with intent: {final_state.get('intent')}")

        return ChatResponse(
            response=final_state.get("response", "Thank you for contacting smart banking support."),
            intent=final_state.get("intent", "general"),
            tool_used=final_state.get("tool_name"),
            tool_result=final_state.get("tool_result"),
            sources=final_state.get("sources", []),
            anomalies=final_state.get("anomalies"),
            latency_ms=latency
        )
    except Exception as e:
        logger.error(f"Error processing LangGraph execution: {e}")
        raise HTTPException(status_code=500, detail=f"Internal AI processing error: {str(e)}")
