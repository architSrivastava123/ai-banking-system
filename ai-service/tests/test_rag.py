import os
import pytest
from app.rag.loader import BankingDocumentLoader
from app.rag.splitter import BankingTextSplitter
from app.rag.retriever import retriever

def test_document_loader():
    """Verify that knowledge documents load with metadata."""
    loader = BankingDocumentLoader(knowledge_dir="./knowledge")
    docs = loader.load_documents()
    assert len(docs) >= 5
    for doc in docs:
        assert "filename" in doc.metadata
        assert "category" in doc.metadata
        assert "source" in doc.metadata

def test_text_splitter():
    """Verify document splitting and chunk metadata."""
    loader = BankingDocumentLoader(knowledge_dir="./knowledge")
    docs = loader.load_documents()
    splitter = BankingTextSplitter(chunk_size=400, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    assert len(chunks) >= len(docs)
    assert "chunk_id" in chunks[0].metadata

def test_retriever_source_formatting():
    """Verify citations formatting."""
    mock_retrieved = [
        {
            "content": "A transfer may fail due to insufficient balance...",
            "metadata": {
                "document": "transfer_faq.md",
                "title": "Money Transfer FAQs",
                "category": "banking-faq",
                "source": "banking-faq/transfer_faq.md"
            }
        },
        {
            "content": "Another chunk from transfer_faq.md",
            "metadata": {
                "document": "transfer_faq.md",
                "title": "Money Transfer FAQs",
                "category": "banking-faq",
                "source": "banking-faq/transfer_faq.md"
            }
        }
    ]
    sources = retriever.format_sources(mock_retrieved)
    # Deduplication test: should only contain 1 source
    assert len(sources) == 1
    assert sources[0]["document"] == "transfer_faq.md"
    assert sources[0]["category"] == "banking-faq"
