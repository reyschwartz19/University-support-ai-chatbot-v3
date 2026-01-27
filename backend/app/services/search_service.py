from ..models import FAQEntry
from .. import db
from flask import current_app
import json
import numpy as np


class SemanticSearchService:
    """Service for performing semantic similarity search"""
    
    @staticmethod
    def cosine_similarity(vec1, vec2):
        """Calculate cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot_product / (norm1 * norm2)
    
    @classmethod
    def search(cls, query_embedding: list, limit: int = 5, threshold: float = None) -> list:
        """
        Search for similar FAQ entries using cosine similarity.
        
        Args:
            query_embedding: The embedding vector of the user query
            limit: Maximum number of results to return
            threshold: Minimum similarity threshold (uses config default if not specified)
        
        Returns:
            List of matching FAQ entries with similarity scores
        """
        if threshold is None:
            threshold = current_app.config.get('CONFIDENCE_THRESHOLD', 0.60)
        
        try:
            # Get all FAQ entries with embeddings
            faq_entries = FAQEntry.query.filter(FAQEntry.embedding.isnot(None)).all()
            
            results = []
            for entry in faq_entries:
                # Parse stored embedding
                try:
                    stored_embedding = json.loads(entry.embedding) if isinstance(entry.embedding, str) else entry.embedding
                except (json.JSONDecodeError, TypeError):
                    continue
                
                # Calculate similarity
                similarity = cls.cosine_similarity(query_embedding, stored_embedding)
                
                if similarity >= threshold:
                    results.append({
                        'id': entry.id,
                        'question': entry.question,
                        'answer': entry.answer,
                        'category': entry.category,
                        'faculty': entry.faculty,
                        'academic_year': entry.academic_year,
                        'tags': entry.tags,
                        'score': float(similarity)
                    })
            
            # Sort by score descending and limit
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:limit]
        
        except Exception as e:
            current_app.logger.error(f"Semantic search error: {str(e)}")
            return []
    
    @classmethod
    def get_top_match_confidence(cls, matches: list) -> float:
        """Get the confidence score of the top match"""
        if not matches:
            return 0.0
        return matches[0].get('score', 0.0)
    
    @classmethod
    def search_by_category(cls, query_embedding: list, category: str, limit: int = 5) -> list:
        """Search within a specific category"""
        try:
            faq_entries = FAQEntry.query.filter(
                FAQEntry.embedding.isnot(None),
                FAQEntry.category == category
            ).all()
            
            results = []
            for entry in faq_entries:
                try:
                    stored_embedding = json.loads(entry.embedding) if isinstance(entry.embedding, str) else entry.embedding
                except (json.JSONDecodeError, TypeError):
                    continue
                
                similarity = cls.cosine_similarity(query_embedding, stored_embedding)
                results.append({
                    'id': entry.id,
                    'question': entry.question,
                    'answer': entry.answer,
                    'category': entry.category,
                    'faculty': entry.faculty,
                    'score': float(similarity)
                })
            
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:limit]
        
        except Exception as e:
            current_app.logger.error(f"Category search error: {str(e)}")
            return []
