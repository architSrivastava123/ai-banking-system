import os
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Smart Banking AI Service"
    version: str = "1.0.0"
    port: int = Field(default=8000, alias="PORT")
    host: str = Field(default="0.0.0.0", alias="HOST")
    
    # Internal Node backend integration
    node_backend_url: str = Field(default="http://localhost:3000", alias="NODE_BACKEND_URL")
    internal_service_secret: str = Field(default="ai-banking-internal-secret-key", alias="INTERNAL_SERVICE_SECRET")
    
    # LLM Settings: 'gemini', 'openai', or 'mock'
    llm_provider: str = Field(default="gemini", alias="LLM_PROVIDER")
    google_api_key: Optional[str] = Field(default=None, alias="GOOGLE_API_KEY")
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")
    llm_model: str = Field(default="gemini-1.5-flash", alias="LLM_MODEL")
    llm_temperature: float = Field(default=0.1, alias="LLM_TEMPERATURE")
    
    # Chroma & Knowledge base
    chroma_persist_directory: str = Field(default="./data/chroma_db", alias="CHROMA_PERSIST_DIRECTORY")
    knowledge_dir: str = Field(default="./knowledge", alias="KNOWLEDGE_DIR")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()
