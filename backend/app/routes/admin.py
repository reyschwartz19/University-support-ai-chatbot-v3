from flask import Blueprint, request, jsonify, current_app
from functools import wraps
from .. import db
from ..models import AdminUser, ChatLog, Feedback, SubmittedQuestion, FAQEntry
from ..services.embedding_service import EmbeddingService
import bcrypt
import jwt
import json
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)


def token_required(f):
    """Decorator to require valid JWT token for admin routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=['HS256']
            )
            current_user = AdminUser.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated


@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        user = AdminUser.query.filter_by(username=username).first()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode(
            {
                'user_id': user.id,
                'username': user.username,
                'role': user.role,
                'exp': datetime.utcnow() + timedelta(hours=8)
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        })
    
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500


@admin_bp.route('/chat-logs', methods=['GET'])
@token_required
def get_chat_logs(current_user):
    """Get chat logs with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        logs = ChatLog.query.order_by(ChatLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Get logs error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve logs'}), 500


@admin_bp.route('/feedback', methods=['GET'])
@token_required
def get_all_feedback(current_user):
    """Get all feedback with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        feedback_list = Feedback.query.order_by(Feedback.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'feedback': [f.to_dict() for f in feedback_list.items],
            'total': feedback_list.total,
            'pages': feedback_list.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Get feedback error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve feedback'}), 500


@admin_bp.route('/submissions', methods=['GET'])
@token_required
def get_submissions(current_user):
    """Get submitted questions for review"""
    try:
        status = request.args.get('status', 'pending')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        submissions = SubmittedQuestion.query.filter_by(status=status).order_by(
            SubmittedQuestion.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'submissions': [s.to_dict() for s in submissions.items],
            'total': submissions.total,
            'pages': submissions.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Get submissions error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve submissions'}), 500


@admin_bp.route('/submissions/<submission_id>/approve', methods=['POST'])
@token_required
def approve_submission(current_user, submission_id):
    """Approve a submitted question and add to FAQ"""
    try:
        data = request.get_json()
        answer = data.get('answer')
        category = data.get('category', 'general')
        faculty = data.get('faculty')
        
        if not answer:
            return jsonify({'error': 'Answer is required'}), 400
        
        submission = SubmittedQuestion.query.get(submission_id)
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Generate embedding for the question
        embedding = EmbeddingService.generate_embedding(submission.question)
        embedding_json = json.dumps(embedding) if embedding else None
        
        # Create FAQ entry
        faq_entry = FAQEntry(
            question=submission.question,
            answer=answer,
            category=category,
            faculty=faculty,
            embedding=embedding_json
        )
        
        submission.status = 'approved'
        
        db.session.add(faq_entry)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Submission approved and added to FAQ',
            'faq_id': faq_entry.id
        })
    
    except Exception as e:
        current_app.logger.error(f"Approve submission error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to approve submission'}), 500


@admin_bp.route('/submissions/<submission_id>/reject', methods=['POST'])
@token_required
def reject_submission(current_user, submission_id):
    """Reject a submitted question"""
    try:
        submission = SubmittedQuestion.query.get(submission_id)
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        submission.status = 'rejected'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Submission rejected'
        })
    
    except Exception as e:
        current_app.logger.error(f"Reject submission error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to reject submission'}), 500


@admin_bp.route('/faq', methods=['GET'])
@token_required
def get_faq_entries(current_user):
    """Get all FAQ entries"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        
        query = FAQEntry.query
        if category:
            query = query.filter_by(category=category)
        
        entries = query.order_by(FAQEntry.last_updated.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'entries': [e.to_dict() for e in entries.items],
            'total': entries.total,
            'pages': entries.pages,
            'current_page': page
        })
    
    except Exception as e:
        current_app.logger.error(f"Get FAQ error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve FAQ entries'}), 500


@admin_bp.route('/faq', methods=['POST'])
@token_required
def create_faq_entry(current_user):
    """Create a new FAQ entry"""
    try:
        data = request.get_json()
        
        question = data.get('question')
        answer = data.get('answer')
        category = data.get('category', 'general')
        faculty = data.get('faculty')
        academic_year = data.get('academic_year')
        tags = data.get('tags', [])
        
        if not question or not answer:
            return jsonify({'error': 'Question and answer are required'}), 400
        
        # Generate embedding
        embedding = EmbeddingService.generate_embedding(question)
        embedding_json = json.dumps(embedding) if embedding else None
        
        faq_entry = FAQEntry(
            question=question,
            answer=answer,
            category=category,
            faculty=faculty,
            academic_year=academic_year,
            tags=tags,
            embedding=embedding_json
        )
        
        db.session.add(faq_entry)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'FAQ entry created',
            'entry': faq_entry.to_dict()
        })
    
    except Exception as e:
        current_app.logger.error(f"Create FAQ error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create FAQ entry'}), 500


@admin_bp.route('/faq/<entry_id>', methods=['PUT'])
@token_required
def update_faq_entry(current_user, entry_id):
    """Update an existing FAQ entry"""
    try:
        data = request.get_json()
        
        entry = FAQEntry.query.get(entry_id)
        if not entry:
            return jsonify({'error': 'FAQ entry not found'}), 404
        
        # Update fields
        if 'question' in data:
            entry.question = data['question']
            # Regenerate embedding if question changed
            embedding = EmbeddingService.generate_embedding(data['question'])
            entry.embedding = json.dumps(embedding) if embedding else None
        
        if 'answer' in data:
            entry.answer = data['answer']
        if 'category' in data:
            entry.category = data['category']
        if 'faculty' in data:
            entry.faculty = data['faculty']
        if 'academic_year' in data:
            entry.academic_year = data['academic_year']
        if 'tags' in data:
            entry.tags = data['tags']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'FAQ entry updated',
            'entry': entry.to_dict()
        })
    
    except Exception as e:
        current_app.logger.error(f"Update FAQ error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update FAQ entry'}), 500


@admin_bp.route('/faq/<entry_id>', methods=['DELETE'])
@token_required
def delete_faq_entry(current_user, entry_id):
    """Delete a FAQ entry"""
    try:
        entry = FAQEntry.query.get(entry_id)
        if not entry:
            return jsonify({'error': 'FAQ entry not found'}), 404
        
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'FAQ entry deleted'
        })
    
    except Exception as e:
        current_app.logger.error(f"Delete FAQ error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete FAQ entry'}), 500


@admin_bp.route('/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    """Get dashboard statistics"""
    try:
        total_chats = ChatLog.query.count()
        fallback_chats = ChatLog.query.filter_by(is_fallback=True).count()
        total_feedback = Feedback.query.count()
        positive_feedback = Feedback.query.filter_by(rating='up').count()
        pending_submissions = SubmittedQuestion.query.filter_by(status='pending').count()
        total_faq = FAQEntry.query.count()
        
        return jsonify({
            'total_chats': total_chats,
            'fallback_rate': round(fallback_chats / total_chats * 100, 2) if total_chats > 0 else 0,
            'total_feedback': total_feedback,
            'satisfaction_rate': round(positive_feedback / total_feedback * 100, 2) if total_feedback > 0 else 0,
            'pending_submissions': pending_submissions,
            'total_faq_entries': total_faq
        })
    
    except Exception as e:
        current_app.logger.error(f"Get stats error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve statistics'}), 500


@admin_bp.route('/trigger-update', methods=['POST'])
@token_required
def trigger_monthly_update(current_user):
    """Trigger monthly knowledge base update"""
    try:
        # Regenerate embeddings for all FAQ entries
        entries = FAQEntry.query.all()
        updated_count = 0
        
        for entry in entries:
            embedding = EmbeddingService.generate_embedding(entry.question)
            entry.embedding = json.dumps(embedding) if embedding else None
            updated_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Updated embeddings for {updated_count} FAQ entries'
        })
    
    except Exception as e:
        current_app.logger.error(f"Update trigger error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to trigger update'}), 500
