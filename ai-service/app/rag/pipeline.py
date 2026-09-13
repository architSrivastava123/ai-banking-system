from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from app.rag.retriever import retriever
from app.services.llm_factory import get_llm
from app.utils.logger import logger

RAG_SYSTEM_PROMPT = """You are an authoritative, accurate AI Banking Policy Assistant.
Your task is to answer the user's banking question strictly based on the provided retrieved documentation.

Rules:
1. Base your answer ONLY on the provided Context.
2. Do NOT invent, assume, or extrapolate policies, fees, limits, or banking rules not present in the Context.
3. If the context does not contain the answer, explicitly say:
   "The available banking documents do not contain specific information to answer this question. Please contact customer support for further assistance."
4. Be professional, direct, concise, and helpful.
"""

class RAGPipeline:
    """
    Executes the grounded RAG workflow:
    Query -> Retrieve Context -> Synthesize with LLM -> Extract Grounded Citations
    """
    def __init__(self):
        self.llm = get_llm()

    async def execute(self, query: str) -> Dict[str, Any]:
        logger.info(f"Executing RAG pipeline for query: '{query}'")
        retrieved_docs = retriever.retrieve(query)
        sources = retriever.format_sources(retrieved_docs)

        if not retrieved_docs:
            return {
                "answer": "The available banking documents do not contain specific information to answer this question. Please contact customer support for further assistance.",
                "sources": [],
                "retrieved_count": 0
            }

        # Build context string
        context_blocks = []
        for i, doc in enumerate(retrieved_docs, start=1):
            source_name = doc["metadata"].get("document", "Document")
            title = doc["metadata"].get("title", "Policy")
            content = doc["content"]
            context_blocks.append(f"--- Document {i}: {title} ({source_name}) ---\n{content}")

        context_text = "\n\n".join(context_blocks)

        user_prompt = f"""Context:
{context_text}

User Question:
{query}

Answer the question strictly based on the context above:"""

        try:
            messages = [
                SystemMessage(content=RAG_SYSTEM_PROMPT),
                HumanMessage(content=user_prompt)
            ]
            response = await self.llm.ainvoke(messages)
            answer = response.content if hasattr(response, "content") else str(response)
        except Exception as e:
            logger.error(f"Error invoking LLM in RAG pipeline: {e}")
            answer = f"According to verified banking records: {retrieved_docs[0]['content'][:300]}..."

        return {
            "answer": answer,
            "sources": sources,
            "retrieved_count": len(retrieved_docs)
        }

rag_pipeline = RAGPipeline()
