from typing import List, Dict, Any
from langchain_core.documents import Document
from app.rag.vectorstore import vectorstore_manager
from app.utils.logger import logger

class BankingRetriever:
    """
    Retrieves grounded context from Chroma and formats source citations.
    """
    def __init__(self, k: int = 4):
        self.k = k

    def retrieve(self, query: str) -> List[Dict[str, Any]]:
        docs = vectorstore_manager.similarity_search(query, k=self.k)
        retrieved_results = []
        for doc in docs:
            retrieved_results.append({
                "content": doc.page_content,
                "metadata": {
                    "document": doc.metadata.get("filename", "unknown_document"),
                    "title": doc.metadata.get("title", "Banking Policy"),
                    "category": doc.metadata.get("category", "General"),
                    "source": doc.metadata.get("source", ""),
                    "chunk_id": doc.metadata.get("chunk_id", 0)
                }
            })
        logger.info(f"Retrieved {len(retrieved_results)} relevant document chunks for query: '{query}'")
        return retrieved_results

    def format_sources(self, retrieved: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicates and formats citations for user response."""
        seen = set()
        sources = []
        for item in retrieved:
            meta = item.get("metadata", {})
            doc_name = meta.get("document", "policy.md")
            if doc_name not in seen:
                seen.add(doc_name)
                sources.append({
                    "document": doc_name,
                    "title": meta.get("title", doc_name),
                    "category": meta.get("category", "Policy"),
                    "source": meta.get("source", "")
                })
        return sources

retriever = BankingRetriever()
