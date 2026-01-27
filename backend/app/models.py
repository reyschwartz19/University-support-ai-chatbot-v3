from . import db
from datetime import datetime
import uuid
import json


def generate_uuid():
    return str(uuid.uuid4())


class FAQEntry(db.Model):
    """FAQ knowledge base entries with embeddings"""
    __tablename__ = 'faq_entries'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    faculty = db.Column(db.String(100))
    academic_year = db.Column(db.String(20))
    tags = db.Column(db.Text)  # Store as JSON string for SQLite compatibility
    embedding = db.Column(db.Text)  # Store as JSON string for SQLite compatibility
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'category': self.category,
            'faculty': self.faculty,
            'academic_year': self.academic_year,
            'tags': self.tags,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }


class ChatLog(db.Model):
    """Chat interaction logs"""
    __tablename__ = 'chat_logs'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_query = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float)
    is_fallback = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to feedback
    feedback = db.relationship('Feedback', backref='chat_log', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_query': self.user_query,
            'bot_response': self.bot_response,
            'confidence': self.confidence,
            'is_fallback': self.is_fallback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Feedback(db.Model):
    """User feedback on chat responses"""
    __tablename__ = 'feedback'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    chat_id = db.Column(db.String(36), db.ForeignKey('chat_logs.id'), nullable=False)
    rating = db.Column(db.String(10), nullable=False)  # 'up' or 'down'
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat_id': self.chat_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SubmittedQuestion(db.Model):
    """User-submitted questions for admin review"""
    __tablename__ = 'submitted_questions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    question = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'context': self.context,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AdminUser(db.Model):
    """Admin users for dashboard access"""
    __tablename__ = 'admin_users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
