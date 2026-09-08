import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config.settings import settings
from app.utils.logger import logger
from app.api.routes import chat, rag, insights, categorize

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Python AI Service for Smart Banking System: LangChain, LangGraph, RAG & Analytics"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time}ms)")
    return response

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred in AI Service.", "detail": str(exc)}
    )

# Register Routers
app.include_router(chat.router)
app.include_router(rag.router)
app.include_router(insights.router)
app.include_router(categorize.router)

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "service": "ai-banking-service",
        "version": settings.version,
        "llm_provider": settings.llm_provider
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
