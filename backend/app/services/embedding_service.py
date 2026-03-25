from sentence_transformers import SentenceTransformer
import numpy as np
from flask import current_app


class EmbeddingService:
    """Service for generating text embeddings using sentence-transformers"""
    
    _model = None
    
    @classmethod
    def get_model(cls):
        """Lazy load the embedding model"""
        if cls._model is None:
            import torch
            torch.set_num_threads(1)  # Reduce memory footprint limit
            model_name = current_app.config.get('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
            cls._model = SentenceTransformer(model_name)
        return cls._model
    
    @classmethod
    def generate_embedding(cls, text: str) -> list:
        """Generate embedding vector for a text string"""
        model = cls.get_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    @classmethod
    def generate_embeddings_batch(cls, texts: list) -> list:
        """Generate embeddings for multiple texts efficiently"""
        model = cls.get_model()
        embeddings = model.encode(texts, convert_to_numpy=True)
        return [emb.tolist() for emb in embeddings]
    
    @classmethod
    def cosine_similarity(cls, vec1: list, vec2: list) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
