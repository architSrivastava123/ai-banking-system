from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.api.deps import verify_internal_secret
from app.rag.pipeline import rag_pipeline
from app.utils.logger import logger

router = APIRouter(prefix="/api/rag", tags=["RAG Policy Search"])

class RAGRequest(BaseModel):
    query: str = Field(..., description="Natural language question regarding bank policies or FAQs")

class SourceItem(BaseModel):
    document: str
    title: str
    category: str
    source: str

class RAGResponse(BaseModel):
    answer: str
    sources: List[SourceItem]
    retrieved_count: int

@router.post("/query", response_model=RAGResponse, dependencies=[Depends(verify_internal_secret)])
async def query_rag(request: RAGRequest):
    logger.info(f"Direct RAG query received: '{request.query}'")
    try:
        result = await rag_pipeline.execute(request.query)
        return RAGResponse(
            answer=result["answer"],
            sources=result["sources"],
            retrieved_count=result["retrieved_count"]
        )
    except Exception as e:
        logger.error(f"Error executing RAG pipeline: {e}")
        raise HTTPException(status_code=500, detail=f"RAG execution error: {str(e)}")
