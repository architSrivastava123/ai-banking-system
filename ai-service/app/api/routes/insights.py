from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from app.api.deps import verify_internal_secret
from app.services.banking_service import banking_service
from app.services.analytics_service import analytics_service
from app.services.llm_factory import get_llm
from langchain_core.messages import HumanMessage
from app.utils.logger import logger

router = APIRouter(prefix="/api", tags=["Financial Insights & Analytics"])
llm = get_llm()

class InsightsResponse(BaseModel):
    user_id: str
    metrics: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    explanation: str

@router.get("/insights", response_model=InsightsResponse, dependencies=[Depends(verify_internal_secret)])
async def get_insights(
    user_id: str = Query(..., description="Target user ID"),
    user_name: Optional[str] = Query("Customer", description="User Name")
):
    logger.info(f"Generating comprehensive AI financial insights for user_id={user_id}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=50)
    metrics = analytics_service.calculate_metrics(transactions)
    anomalies = analytics_service.detect_anomalies(transactions)

    # Prompt LLM for natural language explanation of deterministic metrics
    prompt = (
        f"You are a friendly financial advisor at a bank. "
        f"Explain the following verified spending metrics for customer '{user_name}':\n"
        f"- Total Income: ₹{metrics['income']:,.2f}\n"
        f"- Total Expenses: ₹{metrics['expenses']:,.2f}\n"
        f"- Net Savings: ₹{metrics['savings']:,.2f} ({metrics['savings_rate_pct']}% savings rate)\n"
        f"- Top Spending Category: {metrics['top_category']}\n"
        f"- Number of transactions: {metrics['transaction_count']}\n"
        f"Provide 2-3 sentences of positive, actionable financial coaching."
    )
    try:
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        explanation = response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        logger.error(f"Error calling LLM for insights: {e}")
        explanation = (
            f"Great job saving ₹{metrics['savings']:,.2f} this month! Your highest outflow was in {metrics['top_category']}."
        )

    return InsightsResponse(
        user_id=user_id,
        metrics=metrics,
        anomalies=anomalies,
        explanation=explanation
    )

@router.get("/spending-summary", dependencies=[Depends(verify_internal_secret)])
async def get_spending_summary(user_id: str = Query(..., description="Target user ID")):
    logger.info(f"Fetching spending summary for user_id={user_id}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=50)
    metrics = analytics_service.calculate_metrics(transactions)
    anomalies = analytics_service.detect_anomalies(transactions)

    return {
        "success": True,
        "user_id": user_id,
        "summary": metrics,
        "anomalies": anomalies
    }
