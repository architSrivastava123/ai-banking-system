import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config.settings import settings

SECRET_HEADER = {"x-internal-secret": settings.internal_service_secret}

@pytest.mark.asyncio
async def test_api_security_guard():
    """Verify endpoint rejects requests without the internal secret header."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/chat", json={
            "message": "test",
            "user_id": "u1"
        })
        assert response.status_code == 403

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_rag_query_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/rag/query",
            headers=SECRET_HEADER,
            json={"query": "Why can a bank transfer fail?"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "sources" in data

@pytest.mark.asyncio
async def test_categorize_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/categorize",
            headers=SECRET_HEADER,
            json={
                "description": "Swiggy order #1234",
                "amount": 850.0
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Food & Dining"
        assert data["is_anomaly"] is False
