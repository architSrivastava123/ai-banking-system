from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.utils.logger import logger

class BankingTextSplitter:
    """
    Splits banking documents into coherent semantic chunks while preserving metadata.
    """
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""]
        )

    def split_documents(self, documents: List[Document]) -> List[Document]:
        chunks = self.splitter.split_documents(documents)
        # Enrich metadata with chunk_id
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_id"] = i
        logger.info(f"Split {len(documents)} documents into {len(chunks)} chunks.")
        return chunks
