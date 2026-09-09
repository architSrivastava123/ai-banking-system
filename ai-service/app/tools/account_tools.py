from typing import Dict, Any, List
from langchain_core.tools import tool
from app.services.banking_service import banking_service
from app.utils.logger import logger

@tool
async def get_account_details(user_id: str) -> Dict[str, Any]:
    """
    Retrieve user bank accounts including Account IDs, status, currency, and verified ledger balance.
    Always use this tool when the user asks about their account details or general account status.
    """
    logger.info(f"Tool execution: get_account_details for user_id={user_id}")
    accounts = await banking_service.get_user_accounts(user_id)
    if not accounts:
        return {
            "status": "not_found",
            "message": "No active bank accounts found for this user."
        }
    return {
        "status": "success",
        "accounts": accounts,
        "total_accounts": len(accounts)
    }

@tool
async def get_account_balance(account_id: str) -> Dict[str, Any]:
    """
    Retrieve the exact verified ledger balance for a specific account ID.
    Use this when the user asks 'How much money is in my account?' or asks for the balance of an account ID.
    """
    logger.info(f"Tool execution: get_account_balance for account_id={account_id}")
    balance = await banking_service.get_account_balance(account_id)
    if balance is None:
        return {
            "status": "error",
            "message": f"Account with ID '{account_id}' was not found or could not be verified."
        }
    return {
        "status": "success",
        "account_id": account_id,
        "balance": balance,
        "currency": "INR"
    }
