import os
from typing import Optional, List
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from app.rag.embeddings import get_embeddings
from app.config.settings import settings
from app.utils.logger import logger

class BankingVectorStore:
    """
    Manages the Chroma vector database for banking knowledge,
    supporting persistent storage and similarity search.
    """
    COLLECTION_NAME = "banking_knowledge"

    def __init__(self):
        self.embeddings = get_embeddings()
        self.persist_directory = os.path.abspath(settings.chroma_persist_directory)
        os.makedirs(self.persist_directory, exist_ok=True)
        self._vectorstore: Optional[Chroma] = None

    def get_vectorstore(self) -> Chroma:
        if self._vectorstore is None:
            self._vectorstore = Chroma(
                collection_name=self.COLLECTION_NAME,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            )
        return self._vectorstore

    def add_documents(self, documents: List[Document]) -> int:
        vs = self.get_vectorstore()
        # Chroma add_documents
        vs.add_documents(documents)
        logger.info(f"Added and persisted {len(documents)} chunks to Chroma vector store at {self.persist_directory}")
        return len(documents)

    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        vs = self.get_vectorstore()
        try:
            return vs.similarity_search(query, k=k)
        except Exception as e:
            logger.error(f"Error during vector similarity search: {e}")
            return []

vectorstore_manager = BankingVectorStore()
