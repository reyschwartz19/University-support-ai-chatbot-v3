import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database - Use SQLite for local development, PostgreSQL for production
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///university_chatbot.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Gemini API
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Rate Limiting
    RATELIMIT_DEFAULT = "30 per minute"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # NLP Settings
    CONFIDENCE_THRESHOLD = 0.60
    EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
    MAX_INPUT_LENGTH = 500
    
    # Security
    LOG_RETENTION_DAYS = 30


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
