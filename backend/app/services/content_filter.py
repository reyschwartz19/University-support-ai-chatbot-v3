import re
import bleach


class ContentFilter:
    """Filter for detecting and blocking inappropriate content"""
    
    # Keywords and patterns for filtering
    BLOCKED_KEYWORDS = [
        # Sexual content
        'sex', 'porn', 'nude', 'naked', 'erotic', 'xxx',
        # Violence
        'kill', 'murder', 'bomb', 'terror', 'weapon',
        # Illegal activities
        'drug', 'hack', 'crack', 'pirate', 'steal',
        # Profanity (basic list)
        'damn', 'hell', 'crap'
    ]
    
    # Patterns that indicate potentially problematic queries
    BLOCKED_PATTERNS = [
        r'\b(how\s+to\s+)?(hack|crack|steal|cheat)\b',
        r'\b(buy|sell|get)\s+(drugs?|weapons?)\b',
        r'\b(nude|naked)\s+(photos?|pictures?|images?)\b',
    ]
    
    @classmethod
    def is_inappropriate(cls, text: str) -> tuple[bool, str]:
        """
        Check if text contains inappropriate content.
        Returns (is_blocked, reason)
        """
        text_lower = text.lower()
        
        # Check for blocked keywords
        for keyword in cls.BLOCKED_KEYWORDS:
            if keyword in text_lower:
                return True, f"Content contains inappropriate keyword"
        
        # Check for blocked patterns
        for pattern in cls.BLOCKED_PATTERNS:
            if re.search(pattern, text_lower):
                return True, f"Content matches inappropriate pattern"
        
        return False, ""
    
    @classmethod
    def sanitize_input(cls, text: str) -> str:
        """Sanitize user input to prevent XSS and injection attacks"""
        # Remove HTML tags
        cleaned = bleach.clean(text, tags=[], strip=True)
        # Remove excessive whitespace
        cleaned = ' '.join(cleaned.split())
        return cleaned
    
    @classmethod
    def validate_input(cls, text: str, max_length: int = 500) -> tuple[bool, str]:
        """
        Validate user input.
        Returns (is_valid, error_message)
        """
        if not text or not text.strip():
            return False, "Message cannot be empty"
        
        if len(text) > max_length:
            return False, f"Message exceeds maximum length of {max_length} characters"
        
        # Check for inappropriate content
        is_blocked, reason = cls.is_inappropriate(text)
        if is_blocked:
            return False, "Your message contains content that cannot be processed. Please rephrase your question."
        
        return True, ""
