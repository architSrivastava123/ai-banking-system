from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from app.api.deps import verify_internal_secret
from app.services.analytics_service import analytics_service
from app.utils.logger import logger

router = APIRouter(prefix="/api/categorize", tags=["Transaction Categorization & Anomaly"])

class CategorizeRequest(BaseModel):
    description: str = Field("", description="Transaction merchant or description text")
    amount: float = Field(0.0, description="Transaction transfer amount")
    recipient: Optional[str] = Field("", description="Recipient account or handle")

class CategorizeResponse(BaseModel):
    category: str
    is_anomaly: bool
    risk_level: str
    reasons: List[str]

@router.post("", response_model=CategorizeResponse, dependencies=[Depends(verify_internal_secret)])
async def categorize_transaction_endpoint(request: CategorizeRequest):
    logger.info(f"Categorizing transaction: '{request.description}', amount={request.amount}")
    category = analytics_service.categorize_transaction(request.description, request.recipient or "")
    
    # Check for anomaly
    is_anomaly = False
    risk_level = "low"
    reasons = []

    if request.amount >= 25000:
        is_anomaly = True
        risk_level = "high"
        reasons.append(f"High amount transfer: ₹{request.amount:,.2f} exceeds standard single-transaction limits")
    elif request.amount >= 15000:
        is_anomaly = True
        risk_level = "medium"
        reasons.append(f"Transaction amount ₹{request.amount:,.2f} is unusually elevated")

    return CategorizeResponse(
        category=category,
        is_anomaly=is_anomaly,
        risk_level=risk_level,
        reasons=reasons
    )
