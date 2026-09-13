import os
from pathlib import Path
from typing import List
from langchain_core.documents import Document
from app.utils.logger import logger

class BankingDocumentLoader:
    """
    Loads banking policy, FAQ, and terms documents from the knowledge repository.
    Enriches documents with domain metadata (category, source, title).
    """
    def __init__(self, knowledge_dir: str = "./knowledge"):
        self.knowledge_dir = Path(knowledge_dir)

    def load_documents(self) -> List[Document]:
        documents: List[Document] = []
        if not self.knowledge_dir.exists():
            logger.warning(f"Knowledge directory '{self.knowledge_dir}' does not exist.")
            return documents

        for file_path in self.knowledge_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in [".md", ".txt"]:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        text = f.read()

                    category = file_path.parent.name
                    filename = file_path.name
                    title = filename.replace("_", " ").replace(".md", "").replace(".txt", "").title()

                    # Check for first heading as title
                    lines = text.splitlines()
                    for line in lines:
                        if line.startswith("# "):
                            title = line.replace("# ", "").strip()
                            break

                    doc = Document(
                        page_content=text,
                        metadata={
                            "source": str(file_path.relative_to(self.knowledge_dir)),
                            "filename": filename,
                            "category": category,
                            "title": title
                        }
                    )
                    documents.append(doc)
                    logger.info(f"Loaded knowledge document: {filename} ({category})")
                except Exception as e:
                    logger.error(f"Error loading {file_path}: {e}")

        logger.info(f"Successfully loaded {len(documents)} total knowledge documents.")
        return documents
