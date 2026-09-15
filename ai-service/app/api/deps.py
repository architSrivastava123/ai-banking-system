from fastapi import Header, HTTPException, status
from app.config.settings import settings
from app.utils.logger import logger

async def verify_internal_secret(
    x_internal_secret: str = Header(None, alias="x-internal-secret")
):
    """
    Ensures that incoming requests to the Python AI service
    originate from the authorized Node.js backend gateway.
    """
    expected = settings.internal_service_secret
    if not x_internal_secret or x_internal_secret != expected:
        logger.warning("Unauthorized access attempt to AI service (missing or invalid x-internal-secret)")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid or missing internal service secret"
        )
    return True
