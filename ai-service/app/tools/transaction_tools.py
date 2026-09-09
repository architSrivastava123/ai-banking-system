from typing import Dict, Any, List, Optional
from langchain_core.tools import tool
from app.services.banking_service import banking_service
from app.utils.logger import logger

@tool
async def get_recent_transactions(user_id: str, limit: int = 5) -> Dict[str, Any]:
    """
    Retrieve the most recent transactions for the user's accounts.
    Default limit is 5 transactions.
    Use this when the user asks 'Show my recent transactions' or 'What were my last transactions?'.
    """
    logger.info(f"Tool execution: get_recent_transactions for user_id={user_id}, limit={limit}")
    transactions = await banking_service.get_user_transactions(user_id=user_id, limit=limit)
    return {
        "status": "success",
        "count": len(transactions),
        "transactions": transactions
    }

@tool
async def get_transaction_history(
    user_id: str,
    min_amount: float = 0.0,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Query transaction history with structured filters such as minimum transfer amount.
    Use this when the user asks 'Show transactions above ₹5000' or asks for high-value transfers.
    """
    logger.info(f"Tool execution: get_transaction_history for user_id={user_id}, min_amount={min_amount}")
    transactions = await banking_service.get_user_transactions(
        user_id=user_id,
        limit=limit,
        min_amount=min_amount
    )
    return {
        "status": "success",
        "filtered_count": len(transactions),
        "min_amount_filter": min_amount,
        "transactions": transactions
    }
