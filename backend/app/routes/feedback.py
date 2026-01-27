from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import Feedback, ChatLog

feedback_bp = Blueprint('feedback', __name__)


@feedback_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    """
    Submit feedback for a chat interaction.
    
    Input:
    {
        "chat_id": "uuid",
        "rating": "up | down",
        "comment": "string optional"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Invalid request body'}), 400
        
        chat_id = data.get('chat_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        # Validate required fields
        if not chat_id:
            return jsonify({'error': 'chat_id is required'}), 400
        
        if not rating or rating not in ['up', 'down']:
            return jsonify({'error': 'rating must be "up" or "down"'}), 400
        
        # Verify chat exists
        chat_log = ChatLog.query.get(chat_id)
        if not chat_log:
            return jsonify({'error': 'Chat not found'}), 404
        
        # Create feedback entry
        feedback = Feedback(
            chat_id=chat_id,
            rating=rating,
            comment=comment[:500] if comment else None  # Limit comment length
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully',
            'feedback_id': feedback.id
        })
    
    except Exception as e:
        current_app.logger.error(f"Feedback error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit feedback'}), 500


@feedback_bp.route('/feedback/<chat_id>', methods=['GET'])
def get_feedback(chat_id):
    """Get feedback for a specific chat"""
    try:
        feedback_list = Feedback.query.filter_by(chat_id=chat_id).all()
        return jsonify({
            'feedback': [f.to_dict() for f in feedback_list]
        })
    except Exception as e:
        current_app.logger.error(f"Get feedback error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve feedback'}), 500
