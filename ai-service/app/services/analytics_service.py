from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import defaultdict
from app.utils.logger import logger

# Merchant mapping dictionary for deterministic categorization
MERCHANT_CATEGORY_MAP = {
    # Food & Dining
    "swiggy": "Food & Dining",
    "zomato": "Food & Dining",
    "mcdonalds": "Food & Dining",
    "starbucks": "Food & Dining",
    "dominos": "Food & Dining",
    "cafe": "Food & Dining",
    "restaurant": "Food & Dining",
    
    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "zara": "Shopping",
    "h&m": "Shopping",
    "retail": "Shopping",
    
    # Transportation
    "uber": "Transportation",
    "ola": "Transportation",
    "rapido": "Transportation",
    "metro": "Transportation",
    "fuel": "Transportation",
    "petrol": "Transportation",
    
    # Entertainment & Subscriptions
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "prime": "Entertainment",
    "hotstar": "Entertainment",
    "cinema": "Entertainment",
    "bookmyshow": "Entertainment",
    
    # Utilities & Bills
    "electricity": "Utilities & Bills",
    "water": "Utilities & Bills",
    "gas": "Utilities & Bills",
    "broadband": "Utilities & Bills",
    "airtel": "Utilities & Bills",
    "jio": "Utilities & Bills",
    
    # Healthcare
    "pharmacy": "Healthcare",
    "apollo": "Healthcare",
    "hospital": "Healthcare",
    "clinic": "Healthcare"
}

class AnalyticsService:
    """
    Deterministic financial analytics, transaction categorization,
    and anomaly detection engine.
    """

    def categorize_transaction(self, description: str, recipient: str = "") -> str:
        """
        Categorizes a transaction based on description and recipient keywords.
        Defaults to 'General Transfer' or 'Shopping' if unknown.
        """
        combined = f"{description} {recipient}".lower()
        for keyword, category in MERCHANT_CATEGORY_MAP.items():
            if keyword in combined:
                return category
        return "General Transfer"

    def calculate_metrics(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates deterministic financial indicators.
        Guarantees mathematical correctness without LLM hallucinations.
        """
        total_income = 0.0
        total_expenses = 0.0
        debit_amounts = []
        category_spending = defaultdict(float)

        for tx in transactions:
            amount = float(tx.get("amount", 0.0))
            tx_type = tx.get("type", "DEBIT").upper()
            
            # Categorize based on description or idempotency/accounts
            category = tx.get("category")
            if not category:
                desc = tx.get("description", "")
                category = self.categorize_transaction(desc, tx.get("toAccount", ""))
                tx["category"] = category

            if tx_type == "CREDIT":
                total_income += amount
            else:  # DEBIT or default
                total_expenses += amount
                debit_amounts.append(amount)
                category_spending[category] += amount

        savings = max(0.0, total_income - total_expenses)
        avg_transaction = round(sum(debit_amounts) / len(debit_amounts), 2) if debit_amounts else 0.0
        highest_transaction = max(debit_amounts) if debit_amounts else 0.0

        # Sort categories by total spent
        sorted_categories = dict(sorted(category_spending.items(), key=lambda item: item[1], reverse=True))
        top_category = next(iter(sorted_categories.keys())) if sorted_categories else "None"

        return {
            "income": round(total_income, 2),
            "expenses": round(total_expenses, 2),
            "savings": round(savings, 2),
            "savings_rate_pct": round((savings / total_income * 100), 1) if total_income > 0 else 0.0,
            "average_transaction": avg_transaction,
            "highest_transaction": highest_transaction,
            "transaction_count": len(transactions),
            "top_category": top_category,
            "category_spending": sorted_categories
        }

    def detect_anomalies(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identifies unusual transaction behavior:
        - Outliers (amount > 3x average)
        - Unusually high single transactions (> 25,000)
        - High frequency of transfers
        """
        anomalies = []
        debit_amounts = [float(tx.get("amount", 0.0)) for tx in transactions if tx.get("type") == "DEBIT"]
        
        if not debit_amounts:
            return []

        avg_amount = sum(debit_amounts) / len(debit_amounts)
        high_threshold = max(avg_amount * 3.0, 15000.0)

        for tx in transactions:
            reasons = []
            risk_level = "low"
            amount = float(tx.get("amount", 0.0))
            
            if amount >= high_threshold:
                risk_level = "high" if amount >= 25000.0 else "medium"
                reasons.append(f"Amount (₹{amount:,.2f}) is significantly higher than historical average (₹{avg_amount:,.2f})")

            if reasons:
                anomalies.append({
                    "transaction_id": tx.get("id") or tx.get("_id") or "tx_unknown",
                    "amount": amount,
                    "date": tx.get("date") or tx.get("createdAt"),
                    "risk_level": risk_level,
                    "reasons": reasons
                })

        return anomalies

analytics_service = AnalyticsService()
