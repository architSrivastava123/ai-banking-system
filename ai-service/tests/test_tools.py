import pytest
from unittest.mock import AsyncMock, patch
from app.services.analytics_service import analytics_service

@pytest.mark.asyncio
async def test_analytics_metrics_calculation():
    """Verify deterministic financial calculations."""
    mock_transactions = [
        {"amount": 50000, "type": "CREDIT", "description": "Salary Deposit"},
        {"amount": 1200, "type": "DEBIT", "description": "Swiggy order"},
        {"amount": 3500, "type": "DEBIT", "description": "Amazon shopping"},
        {"amount": 600, "type": "DEBIT", "description": "Uber ride"},
        {"amount": 800, "type": "DEBIT", "description": "Netflix subscription"}
    ]
    metrics = analytics_service.calculate_metrics(mock_transactions)
    
    assert metrics["income"] == 50000.0
    assert metrics["expenses"] == 6100.0
    assert metrics["savings"] == 43900.0
    assert metrics["transaction_count"] == 5
    assert "Food & Dining" in metrics["category_spending"]
    assert "Shopping" in metrics["category_spending"]
    assert metrics["top_category"] == "Shopping"

def test_merchant_categorization():
    """Verify merchant keyword mapping."""
    assert analytics_service.categorize_transaction("Dinner at Zomato") == "Food & Dining"
    assert analytics_service.categorize_transaction("Order from Flipkart") == "Shopping"
    assert analytics_service.categorize_transaction("Monthly Spotify bill") == "Entertainment"
    assert analytics_service.categorize_transaction("Electricity Board bill payment") == "Utilities & Bills"
    assert analytics_service.categorize_transaction("Random Transfer to Friend") == "General Transfer"

def test_anomaly_detection():
    """Verify anomaly detection on high value transfers."""
    normal_transactions = [
        {"id": "tx1", "amount": 500, "type": "DEBIT"},
        {"id": "tx2", "amount": 700, "type": "DEBIT"},
        {"id": "tx3", "amount": 400, "type": "DEBIT"},
        {"id": "tx4", "amount": 30000, "type": "DEBIT", "description": "Unusual high expense"}
    ]
    anomalies = analytics_service.detect_anomalies(normal_transactions)
    assert len(anomalies) == 1
    assert anomalies[0]["amount"] == 30000.0
    assert anomalies[0]["risk_level"] == "high"
