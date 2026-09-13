import os
import hashlib
from typing import List
from langchain_core.embeddings import Embeddings
from app.config.settings import settings
from app.utils.logger import logger

class FastDeterministicEmbeddings(Embeddings):
    """
    Lightweight, deterministic offline embedding model based on n-gram hashing.
    Generates consistent normalized 384-dimensional dense vectors without requiring
    external API calls or heavy PyTorch downloads.
    Guarantees Chroma operates seamlessly in any environment.
    """
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _embed_text(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        words = text.lower().split()
        if not words:
            return vec
        for word in words:
            # Deterministic hash to dimension index
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            vec[idx] += 1.0
        # Normalize vector
        magnitude = sum(x * x for x in vec) ** 0.5
        if magnitude > 0:
            vec = [x / magnitude for x in vec]
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed_text(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed_text(text)

def get_embeddings() -> Embeddings:
    """
    Returns appropriate embeddings provider based on environment configuration.
    """
    provider = settings.llm_provider.lower().strip()

    if provider == "gemini":
        api_key = settings.google_api_key or os.getenv("GOOGLE_API_KEY")
        if api_key and api_key != "your_google_gemini_api_key_here":
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
                logger.info("Using Google Generative AI Embeddings")
                return GoogleGenerativeAIEmbeddings(
                    model="models/embedding-001",
                    google_api_key=api_key
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Google Embeddings ({e}). Falling back to fast embeddings.")

    elif provider == "openai":
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your_openai_api_key_here":
            try:
                from langchain_openai import OpenAIEmbeddings
                logger.info("Using OpenAI Embeddings")
                return OpenAIEmbeddings(
                    model="text-embedding-3-small",
                    api_key=api_key
                )
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI Embeddings ({e}). Falling back to fast embeddings.")

    logger.info("Using FastDeterministicEmbeddings for local vector database operation.")
    return FastDeterministicEmbeddings()
