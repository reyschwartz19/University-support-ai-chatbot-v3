import google.generativeai as genai
from flask import current_app


class GeminiService:
    """Service for interacting with Gemini API for RAG responses"""
    
    _configured = False
    
    @classmethod
    def configure(cls):
        """Configure Gemini API with key"""
        if not cls._configured:
            api_key = current_app.config.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                cls._configured = True
    
    @classmethod
    def generate_response(cls, user_query: str, context_entries: list) -> str:
        """
        Generate a response using Gemini API with RAG.
        
        Args:
            user_query: The user's question
            context_entries: List of relevant FAQ entries as context
        
        Returns:
            Generated response string
        """
        cls.configure()
        
        # Format context from FAQ entries
        context_text = cls._format_context(context_entries)
        
        # Build the prompt following the exact specification
        prompt = cls._build_prompt(user_query, context_text)
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return "I apologize, but I was unable to generate a response. Please try rephrasing your question or contact the relevant administrative office for assistance."
        
        except Exception as e:
            current_app.logger.error(f"Gemini API error: {str(e)}")
            return "I apologize, but there was an error processing your request. Please try again later or contact the relevant administrative office for assistance."
    
    @classmethod
    def _format_context(cls, context_entries: list) -> str:
        """Format FAQ entries as context for the prompt"""
        if not context_entries:
            return "No relevant information found in the knowledge base."
        
        context_parts = []
        for i, entry in enumerate(context_entries, 1):
            context_parts.append(f"""
Entry {i}:
Question: {entry.get('question', '')}
Answer: {entry.get('answer', '')}
Category: {entry.get('category', 'General')}
Faculty: {entry.get('faculty', 'All Faculties')}
""")
        
        return "\n".join(context_parts)
    
    @classmethod
    def _build_prompt(cls, user_query: str, context_text: str) -> str:
        """Build the RAG prompt following exact specification"""
        return f"""SYSTEM:
You are a university administrative chatbot.
You must use formal institutional language.
You must answer only using provided context.
You must not invent information.
If information is missing, state so.

USER:
{user_query}

CONTEXT:
{context_text}

RULES:
No hallucination
No personal opinion
No scope expansion

Please provide a formal, accurate response to the user's question based solely on the context provided. If the context does not contain sufficient information to answer the question, clearly state that the information is not available and suggest the user contact the appropriate administrative office."""
    
    @classmethod
    def generate_fallback_response(cls, user_query: str) -> str:
        """Generate a fallback response when confidence is low"""
        return """I apologize, but I was unable to find sufficient information to answer your question accurately.

For assistance with your query, I recommend the following options:

1. **Contact the Registrar's Office** - For registration and enrollment inquiries
2. **Contact the Finance Office** - For fee and payment inquiries
3. **Contact the Examinations Office** - For examination-related inquiries
4. **Contact Student Affairs** - For general student services

Alternatively, you may submit your question for review by our administrative team using the feedback option below. We will work to include this information in our knowledge base.

Would you like to submit your question for review?"""
