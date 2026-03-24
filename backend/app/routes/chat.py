from flask import Blueprint, request, jsonify, current_app
from .. import db, limiter
from ..models import ChatLog, FAQEntry
from ..services.content_filter import ContentFilter
from ..services.embedding_service import EmbeddingService
from ..services.nlp_service import NLPService
from ..services.gemini_service import GeminiService
from ..services.search_service import SemanticSearchService

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
@limiter.limit("30 per minute")
def chat():
    """
    Main chat endpoint following the 10-step processing pipeline:
    1. Validate input length and content
    2. Filter immoral, sexual, illegal content
    3. Normalize text
    4. Generate embedding
    5. Perform semantic similarity search
    6. Calculate confidence score
    7. If confidence >= 0.60: retrieve matching FAQ, construct prompt, generate response
    8. If confidence < 0.60: trigger fallback
    9. Validate output
    10. Store interaction in database
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request body',
                'response': None,
                'confidence': 0,
                'fallback': True
            }), 400
        
        message = data.get('message', '')
        
        # Step 1: Validate input length and content
        is_valid, error_msg = ContentFilter.validate_input(
            message, 
            current_app.config.get('MAX_INPUT_LENGTH', 500)
        )
        
        if not is_valid:
            return jsonify({
                'error': error_msg,
                'response': error_msg,
                'confidence': 0,
                'fallback': True
            }), 400
        
        # Step 2: Content already filtered in validate_input
        # Step 3: Sanitize and normalize text
        sanitized_message = ContentFilter.sanitize_input(message)
        normalized_message = NLPService.normalize_text(sanitized_message)
        
        # Step 4: Generate embedding
        query_embedding = EmbeddingService.generate_embedding(normalized_message)
        
        # Step 5: Perform semantic similarity search
        threshold = current_app.config.get('CONFIDENCE_THRESHOLD', 0.60)
        matches = SemanticSearchService.search(query_embedding, limit=5, threshold=0)  # Get all for evaluation
        
        # Step 6: Calculate confidence score
        confidence = SemanticSearchService.get_top_match_confidence(matches)
        
        # Filter matches above threshold for context
        relevant_matches = [m for m in matches if m['score'] >= threshold]
        
        # Steps 7 & 8: Generate response based on confidence
        is_fallback = confidence < threshold
        
        if is_fallback:
            # Step 8: Trigger fallback
            response_text = GeminiService.generate_fallback_response(sanitized_message)
        else:
            # Step 7: Generate RAG response
            # Check if clarification is needed
            if NLPService.is_clarification_needed(relevant_matches):
                response_text = _generate_clarification_response(relevant_matches)
            else:
                # Convert matches to context format
                context_entries = [
                    {
                        'question': m['question'],
                        'answer': m['answer'],
                        'category': m['category'],
                        'faculty': m['faculty']
                    }
                    for m in relevant_matches[:3]  # Use top 3 matches
                ]
                response_text = GeminiService.generate_response(sanitized_message, context_entries)
        
        # Step 9: Validate output (basic validation)
        if not response_text:
            response_text = "I apologize, but I was unable to process your request. Please try again."
            is_fallback = True
        
        # Step 10: Store interaction in database
        chat_log = ChatLog(
            user_query=sanitized_message,
            bot_response=response_text,
            confidence=confidence,
            is_fallback=is_fallback
        )
        db.session.add(chat_log)
        db.session.commit()
        
        return jsonify({
            'response': response_text,
            'confidence': round(confidence, 2),
            'fallback': is_fallback,
            'chat_id': chat_log.id
        })
    
    except Exception as e:
        import traceback
        current_app.logger.error(f"Chat error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'response': 'I apologize, but there was an error processing your request. Please try again later.',
            'confidence': 0,
            'fallback': True
        }), 500


def _generate_clarification_response(matches: list) -> str:
    """Generate a response asking for clarification when multiple close matches exist"""
    options = []
    for i, match in enumerate(matches[:3], 1):
        options.append(f"{i}. {match['question']}")
    
    return f"""I found multiple topics that might relate to your question. Could you please clarify which of the following you're asking about?

{chr(10).join(options)}

Please rephrase your question or select one of the options above."""


@chat_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'university-chatbot'})
