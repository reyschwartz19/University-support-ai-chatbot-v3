from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import SubmittedQuestion
from ..services.content_filter import ContentFilter

faq_bp = Blueprint('faq', __name__)


@faq_bp.route('/faq-submission', methods=['POST'])
def submit_question():
    """
    Submit a question for admin review.
    
    Input:
    {
        "question": "string",
        "context": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Invalid request body'}), 400
        
        question = data.get('question', '')
        context = data.get('context', '')
        
        # Validate question
        if not question or not question.strip():
            return jsonify({'error': 'Question is required'}), 400
        
        if len(question) > 1000:
            return jsonify({'error': 'Question exceeds maximum length of 1000 characters'}), 400
        
        # Sanitize input
        question = ContentFilter.sanitize_input(question)
        context = ContentFilter.sanitize_input(context) if context else ''
        
        # Check for inappropriate content
        is_blocked, reason = ContentFilter.is_inappropriate(question)
        if is_blocked:
            return jsonify({'error': 'Question contains inappropriate content'}), 400
        
        # Create submission
        submission = SubmittedQuestion(
            question=question,
            context=context[:500] if context else None  # Limit context length
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Your question has been submitted for review. Thank you for helping us improve our knowledge base.',
            'submission_id': submission.id
        })
    
    except Exception as e:
        current_app.logger.error(f"FAQ submission error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to submit question'}), 500


@faq_bp.route('/faq-categories', methods=['GET'])
def get_categories():
    """Get list of FAQ categories"""
    categories = [
        {'id': 'registration', 'name': 'Registration', 'description': 'Course registration and enrollment'},
        {'id': 'academic-calendar', 'name': 'Academic Calendar', 'description': 'Important dates and deadlines'},
        {'id': 'examinations', 'name': 'Examinations', 'description': 'Exam rules, schedules, and procedures'},
        {'id': 'fees', 'name': 'Fees & Payments', 'description': 'Tuition fees and payment procedures'},
        {'id': 'offices', 'name': 'Administrative Offices', 'description': 'Office locations and responsibilities'},
        {'id': 'staff', 'name': 'University Staff', 'description': 'Key administrators and their roles'},
        {'id': 'general', 'name': 'General', 'description': 'Other administrative inquiries'}
    ]
    return jsonify({'categories': categories})
