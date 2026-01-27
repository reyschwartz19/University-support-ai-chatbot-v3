import re
import unicodedata


class NLPService:
    """Natural Language Processing utilities"""
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for processing"""
        # Convert to lowercase
        text = text.lower()
        
        # Normalize unicode characters
        text = unicodedata.normalize('NFKD', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    @staticmethod
    def extract_keywords(text: str) -> list:
        """Extract important keywords from text"""
        # Remove common stop words
        stop_words = {
            'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
            'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'under', 'again',
            'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
            'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
            'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until',
            'while', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
            'those', 'am', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
            'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
            'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
            'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'
        }
        
        # Tokenize and filter
        words = re.findall(r'\b[a-z]+\b', text.lower())
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        return keywords
    
    @staticmethod
    def detect_question_type(text: str) -> str:
        """Detect the type of question being asked"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['when', 'date', 'deadline', 'schedule']):
            return 'temporal'
        elif any(word in text_lower for word in ['where', 'location', 'office', 'building']):
            return 'location'
        elif any(word in text_lower for word in ['who', 'contact', 'person', 'staff']):
            return 'person'
        elif any(word in text_lower for word in ['how', 'process', 'procedure', 'steps']):
            return 'procedural'
        elif any(word in text_lower for word in ['what', 'which', 'define', 'explain']):
            return 'informational'
        elif any(word in text_lower for word in ['fee', 'pay', 'cost', 'price', 'money']):
            return 'financial'
        else:
            return 'general'
    
    @staticmethod
    def is_clarification_needed(matches: list, threshold_gap: float = 0.1) -> bool:
        """
        Determine if clarification is needed based on multiple close matches.
        Returns True if top matches are too close in similarity.
        """
        if len(matches) < 2:
            return False
        
        # If top two matches are very close in score, ask for clarification
        score_diff = matches[0]['score'] - matches[1]['score']
        return score_diff < threshold_gap
