class BankingAIException(Exception):
    """Base exception for banking AI service"""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class LLMProviderException(BankingAIException):
    def __init__(self, message: str):
        super().__init__(f"LLM Provider Error: {message}", status_code=502)

class RAGException(BankingAIException):
    def __init__(self, message: str):
        super().__init__(f"RAG Retrieval Error: {message}", status_code=500)

class BankingBackendException(BankingAIException):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(f"Banking Backend Error: {message}", status_code=status_code)
