import os
import sys
from pathlib import Path

# Ensure UTF-8 standard output on Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add project root to sys.path so app imports work cleanly
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
sys.path.insert(0, str(project_root))

from app.rag.loader import BankingDocumentLoader
from app.rag.splitter import BankingTextSplitter
from app.rag.vectorstore import vectorstore_manager
from app.utils.logger import logger

def ingest():
    """
    Ingests all markdown/txt banking documents into Chroma Vector DB.
    """
    print("=" * 60)
    print("[BANKING-SYSTEM] SMART BANKING - KNOWLEDGE INGESTION PIPELINE")
    print("=" * 60)

    knowledge_path = project_root / "knowledge"
    print(f"Loading documents from: {knowledge_path}")

    loader = BankingDocumentLoader(knowledge_dir=str(knowledge_path))
    raw_docs = loader.load_documents()

    if not raw_docs:
        print("ERROR: No documents found in knowledge directory!")
        return

    print(f"[OK] Loaded {len(raw_docs)} documents.")

    splitter = BankingTextSplitter(chunk_size=500, chunk_overlap=80)
    chunks = splitter.split_documents(raw_docs)
    print(f"[OK] Created {len(chunks)} semantic text chunks.")

    print(f"Indexing chunks into Chroma vector store at: {vectorstore_manager.persist_directory} ...")
    count = vectorstore_manager.add_documents(chunks)
    print(f"[SUCCESS] Successfully ingested and persisted {count} chunks into Chroma Vector DB!")
    print("=" * 60)

if __name__ == "__main__":
    ingest()
