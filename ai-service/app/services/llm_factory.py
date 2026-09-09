import os
from typing import Any, List, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage
from langchain_core.outputs import ChatResult, ChatGeneration
from app.config.settings import settings
from app.utils.logger import logger

class MockChatModel(BaseChatModel):
    """
    Deterministic rule-based mock chat model for local testing and offline verification.
    Ensures the LangGraph and LangChain pipelines function without requiring paid API keys.
    """
    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Any = None,
        **kwargs: Any
    ) -> ChatResult:
        last_message = messages[-1].content if messages else ""
        content_lower = str(last_message).lower()
        
        # Determine appropriate mock response
        if "balance" in content_lower:
            reply = "Based on your verified account records, your current active account balance is ₹50,000.00 INR."
        elif "spending" in content_lower or "expense" in content_lower:
            reply = "You spent ₹14,250.00 this month. Your highest spending was in the Food & Dining category (₹6,200.00), followed by Shopping (₹4,500.00)."
        elif "fail" in content_lower or "policy" in content_lower:
            reply = "According to Section 4 of our Banking Transaction Policy, a transfer may fail due to: 1) Insufficient ledger balance, 2) Inactive/Frozen accounts, 3) Transferring to the same account ID, 4) Invalid account numbers, or 5) Exceeding daily transfer caps (₹100,000/day)."
        elif "transaction" in content_lower or "history" in content_lower:
            reply = "Here are your recent transactions: You completed 3 transactions this month totaling ₹14,250 in debits and ₹50,000 in credits."
        else:
            reply = f"Hello! I am your AI Banking Assistant. I can help you check balances, analyze your spending habits, view recent transactions, and explain bank policies. How can I assist you today?"
            
        generation = ChatGeneration(message=AIMessage(content=reply))
        return ChatResult(generations=[generation])

    @property
    def _llm_type(self) -> str:
        return "mock-chat-model"

def get_llm() -> BaseChatModel:
    """
    Factory function returning the configured LLM.
    Supports Google Gemini, OpenAI, and Mock fallbacks.
    """
    provider = settings.llm_provider.lower().strip()
    
    if provider == "gemini":
        api_key = settings.google_api_key or os.getenv("GOOGLE_API_KEY")
        if api_key and api_key != "your_google_gemini_api_key_here":
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                logger.info("Initializing Google Gemini Chat Model")
                return ChatGoogleGenerativeAI(
                    model=settings.llm_model or "gemini-1.5-flash",
                    google_api_key=api_key,
                    temperature=settings.llm_temperature
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini ({e}). Falling back to MockChatModel.")
        else:
            logger.info("No valid GOOGLE_API_KEY found. Using MockChatModel for offline operation.")
            
    elif provider == "openai":
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        if api_key and api_key != "your_openai_api_key_here":
            try:
                from langchain_openai import ChatOpenAI
                logger.info("Initializing OpenAI Chat Model")
                return ChatOpenAI(
                    model="gpt-3.5-turbo",
                    api_key=api_key,
                    temperature=settings.llm_temperature
                )
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI ({e}). Falling back to MockChatModel.")
        else:
            logger.info("No valid OPENAI_API_KEY found. Using MockChatModel for offline operation.")
            
    logger.info("Using MockChatModel (deterministic offline provider)")
    return MockChatModel()
