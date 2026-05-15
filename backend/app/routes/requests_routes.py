from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models import StudentRequest, BlockedDate
from .admin import token_required
from datetime import datetime
import string
import random

requests_bp = Blueprint('requests', __name__)

def generate_reference_code():
    while True:
        chars = string.ascii_uppercase + string.digits
        code = "UBA-" + ''.join(random.choice(chars) for _ in range(8))
        if not StudentRequest.query.filter_by(reference_code=code).first():
            return code

@requests_bp.route('/requests/submit', methods=['POST'])
def submit_request():
    try:
        data = request.get_json()
        student_name = data.get('student_name')
        student_id = data.get('student_id')
        request_type = data.get('request_type')
        details = data.get('details')
        preferred_date = data.get('preferred_date')
        preferred_time = data.get('preferred_time')
        
        if not all([student_name, student_id, request_type, preferred_date, preferred_time]):
            return jsonify({"success": False, "error": "Missing required fields."}), 400
            
        # Check if date is blocked
        blocked = BlockedDate.query.filter_by(date=preferred_date).first()
        if blocked:
            return jsonify({
                "success": False, 
                "error": "The office is not available on this date. Please choose another day."
            }), 400
            
        # Check if weekend
        try:
            date_obj = datetime.strptime(preferred_date, '%Y-%m-%d')
            if date_obj.weekday() >= 5: # 5=Sat, 6=Sun
                return jsonify({"success": False, "error": "Please select a weekday."}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Invalid date format."}), 400
            
        # Check slot capacity
        slot_count = StudentRequest.query.filter(
            StudentRequest.preferred_date == preferred_date,
            StudentRequest.preferred_time == preferred_time,
            StudentRequest.status != 'Completed'
        ).count()
        
        if slot_count >= 5:
            return jsonify({
                "success": False, 
                "error": "This time slot is fully booked. Please choose another time."
            }), 400
            
        ref_code = generate_reference_code()
        
        new_req = StudentRequest(
            reference_code=ref_code,
            student_name=student_name,
            student_id=student_id,
            request_type=request_type,
            details=details,
            preferred_date=preferred_date,
            preferred_time=preferred_time
        )
        
        db.session.add(new_req)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "reference": ref_code,
            "appointment": {
                "date": preferred_date,
                "time": preferred_time
            }
        })
    except Exception as e:
        current_app.logger.error(f"Submit request error: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Server error'}), 500

@requests_bp.route('/requests/status/<reference_code>', methods=['GET'])
def check_status(reference_code):
    req = StudentRequest.query.filter(StudentRequest.reference_code.ilike(reference_code)).first()
    if not req:
        return jsonify({"success": False, "error": "No request found with that reference code."}), 404
        
    return jsonify({
        "success": True,
        "data": {
            "reference": req.reference_code,
            "request_type": req.request_type,
            "status": req.status,
            "preferred_date": req.preferred_date,
            "preferred_time": req.preferred_time,
            "admin_note": req.admin_note,
            "created_at": req.created_at.isoformat() if req.created_at else None
        }
    })

@requests_bp.route('/requests/slots', methods=['GET'])
def get_slots():
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"available": False, "reason": "Date is required", "slots": []}), 400
        
    blocked = BlockedDate.query.filter_by(date=date_str).first()
    if blocked:
        return jsonify({"available": False, "reason": blocked.reason or "Office is closed", "slots": []})
        
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        if date_obj.weekday() >= 5:
            return jsonify({"available": False, "reason": "Office is closed on weekends", "slots": []})
    except ValueError:
        return jsonify({"available": False, "reason": "Invalid date format", "slots": []}), 400
        
    all_slots = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00"]
    
    # get bookings
    bookings = db.session.query(StudentRequest.preferred_time, db.func.count(StudentRequest.id))\
        .filter(StudentRequest.preferred_date == date_str)\
        .filter(StudentRequest.status != 'Completed')\
        .group_by(StudentRequest.preferred_time).all()
        
    booking_map = {time: count for time, count in bookings}
    
    slots_data = []
    for s in all_slots:
        count = booking_map.get(s, 0)
        slots_data.append({
            "time": s,
            "booked": count,
            "available": count < 5
        })
        
    return jsonify({
        "available": True,
        "slots": slots_data
    })

@requests_bp.route('/requests/blocked-dates', methods=['GET'])
def get_public_blocked_dates():
    today = datetime.now().strftime('%Y-%m-%d')
    dates = BlockedDate.query.filter(BlockedDate.date >= today).order_by(BlockedDate.date.asc()).all()
    return jsonify({
        "blocked_dates": [d.date for d in dates]
    })

# --- ADMIN ENDPOINTS ---

@requests_bp.route('/admin/requests', methods=['GET'])
@token_required
def get_admin_requests(current_user):
    status = request.args.get('status')
    date = request.args.get('date')
    req_type = request.args.get('request_type')
    
    query = StudentRequest.query
    if status and status != 'All':
        query = query.filter_by(status=status)
    if date:
        query = query.filter_by(preferred_date=date)
    if req_type:
        query = query.filter_by(request_type=req_type)
        
    reqs = query.order_by(StudentRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reqs])

@requests_bp.route('/admin/requests/<int:req_id>', methods=['PATCH'])
@token_required
def update_request(current_user, req_id):
    req = StudentRequest.query.get(req_id)
    if not req:
        return jsonify({"success": False, "error": "Not found"}), 404
        
    data = request.get_json()
    if 'status' in data:
        valid_statuses = ["Pending", "Processing", "Ready for Pickup", "Completed"]
        if data['status'] in valid_statuses:
            req.status = data['status']
    if 'admin_note' in data:
        req.admin_note = data['admin_note']
        
    db.session.commit()
    return jsonify(req.to_dict())

@requests_bp.route('/admin/blocked-dates', methods=['GET'])
@token_required
def get_admin_blocked_dates(current_user):
    dates = BlockedDate.query.order_by(BlockedDate.date.asc()).all()
    return jsonify([d.to_dict() for d in dates])

@requests_bp.route('/admin/blocked-dates', methods=['POST'])
@token_required
def add_blocked_date(current_user):
    data = request.get_json()
    date_str = data.get('date')
    reason = data.get('reason')
    
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        if date_obj < today:
            return jsonify({"success": False, "error": "Cannot block past dates."}), 400
    except ValueError:
        return jsonify({"success": False, "error": "Invalid date format."}), 400
        
    existing = BlockedDate.query.filter_by(date=date_str).first()
    if existing:
        return jsonify({"success": False, "error": "This date is already blocked."}), 400
        
    bd = BlockedDate(
        date=date_str,
        reason=reason,
        blocked_by=current_user.username
    )
    db.session.add(bd)
    db.session.commit()
    
    return jsonify({"success": True, "blocked_date": bd.to_dict()})

@requests_bp.route('/admin/blocked-dates/<int:bd_id>', methods=['DELETE'])
@token_required
def delete_blocked_date(current_user, bd_id):
    bd = BlockedDate.query.get(bd_id)
    if bd:
        db.session.delete(bd)
        db.session.commit()
    return jsonify({"success": True})
