-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- FAQ Entries table
CREATE TABLE IF NOT EXISTS faq_entries (
    id VARCHAR(36) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    faculty VARCHAR(100),
    academic_year VARCHAR(20),
    tags TEXT[],
    embedding vector(384),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_query TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    confidence FLOAT,
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(36) PRIMARY KEY,
    chat_id VARCHAR(36) REFERENCES chat_logs(id),
    rating VARCHAR(10) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submitted Questions table
CREATE TABLE IF NOT EXISTS submitted_questions (
    id VARCHAR(36) PRIMARY KEY,
    question TEXT NOT NULL,
    context TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_entries(category);
CREATE INDEX IF NOT EXISTS idx_faq_faculty ON faq_entries(faculty);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_chat ON feedback(chat_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submitted_questions(status);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_faq_embedding ON faq_entries USING hnsw (embedding vector_cosine_ops);
