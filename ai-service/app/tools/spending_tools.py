from typing import Dict, Any
from langchain_core.tools import tool
from app.services.banking_service import banking_service
from app.services.analytics_service import analytics_service
from app.utils.logger import logger

@tool
async def get_monthly_spending(user_id: str) -> Dict[str, Any]:
    """
    Retrieve deterministic spending analytics for the user:
    Includes total income, total expenses, net savings, and average debit.
    Use this when the user asks 'How much did I spend this month?' or 'What are my total expenses?'.
    """
    logger.info(f"Tool execution: get_monthly_spending for user_id={user_id}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=50)
    metrics = analytics_service.calculate_metrics(transactions)
    anomalies = analytics_service.detect_anomalies(transactions)
    
    return {
        "status": "success",
        "metrics": metrics,
        "anomalies_detected": len(anomalies),
        "anomalies": anomalies
    }

@tool
async def get_spending_by_category(user_id: str) -> Dict[str, Any]:
    """
    Retrieve breakdown of spending categorized by expense type (Food, Shopping, Transportation, Bills, Entertainment).
    Use this when the user asks 'How much did I spend on food?' or 'Break down my expenses by category'.
    """
    logger.info(f"Tool execution: get_spending_by_category for user_id={user_id}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=50)
    metrics = analytics_service.calculate_metrics(transactions)
    
    return {
        "status": "success",
        "top_category": metrics["top_category"],
        "category_spending": metrics["category_spending"]
    }
