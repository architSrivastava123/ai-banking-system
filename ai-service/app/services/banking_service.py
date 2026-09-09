import httpx
from typing import Dict, Any, List, Optional
from app.config.settings import settings
from app.utils.logger import logger
from app.utils.exceptions import BankingBackendException

class BankingService:
    """
    HTTP client for the Node.js Express backend internal endpoints.
    Provides read-only access to user accounts, balances, and transactions.
    """
    def __init__(self):
        self.base_url = settings.node_backend_url.rstrip("/")
        self.headers = {
            "Content-Type": "application/json",
            "x-internal-secret": settings.internal_service_secret
        }

    async def get_user_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all accounts belonging to a user with live ledger balances."""
        url = f"{self.base_url}/api/internal/users/{user_id}/accounts"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("accounts", [])
                logger.error(f"Failed to fetch accounts: {res.status_code} {res.text}")
                return []
        except Exception as e:
            logger.warning(f"Error connecting to Node backend for accounts ({e}). Returning empty list.")
            return []

    async def get_account_balance(self, account_id: str) -> Optional[float]:
        """Fetch real-time ledger balance for an account."""
        url = f"{self.base_url}/api/internal/accounts/{account_id}/balance"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    return res.json().get("balance", 0.0)
                return None
        except Exception as e:
            logger.warning(f"Error fetching balance from Node backend: {e}")
            return None

    async def get_user_transactions(
        self,
        user_id: str,
        limit: int = 10,
        min_amount: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Fetch transactions for user accounts."""
        url = f"{self.base_url}/api/internal/users/{user_id}/transactions"
        params = {"limit": limit, "minAmount": min_amount}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=self.headers, params=params)
                if res.status_code == 200:
                    return res.json().get("transactions", [])
                return []
        except Exception as e:
            logger.warning(f"Error fetching transactions: {e}")
            return []

    async def get_ledger_summary(self, user_id: str) -> Dict[str, Any]:
        """Fetch total credits, debits, and balance summary."""
        url = f"{self.base_url}/api/internal/users/{user_id}/spending-summary"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=self.headers)
                if res.status_code == 200:
                    return res.json().get("summary", {})
                return {}
        except Exception as e:
            logger.warning(f"Error fetching ledger summary: {e}")
            return {}

banking_service = BankingService()
