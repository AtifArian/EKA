from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Notification, Message, ChatRequest, Doctor, User

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_counts():
    current_user_id = int(get_jwt_identity())
    inbox_unread = Notification.query.filter_by(user_id=current_user_id, type='message', is_read=False).count()
    # doctor-only pending requests
    user = User.query.get(current_user_id)
    pending_requests = 0
    if user and user.is_doctor:
        doctor = Doctor.query.filter_by(user_id=current_user_id).first()
        if doctor:
            pending_requests = ChatRequest.query.filter_by(to_doctor_id=doctor.id, status='pending').count()
    journals_unread = Notification.query.filter_by(user_id=current_user_id, type='journal', is_read=False).count()
    return jsonify({
        'inbox_unread_count': inbox_unread,
        'chat_requests_pending_count': pending_requests,
        'journals_unread_count': journals_unread
    }), 200

@notifications_bp.route('/read', methods=['PUT'])
@jwt_required()
def mark_scope_read():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    scope = data.get('scope')
    if scope == 'inbox':
        Notification.query.filter_by(user_id=current_user_id, type='message', is_read=False).update({'is_read': True})
    elif scope == 'chat_requests':
        Notification.query.filter_by(user_id=current_user_id, type='chat_request', is_read=False).update({'is_read': True})
    elif scope == 'journals':
        Notification.query.filter_by(user_id=current_user_id, type='journal', is_read=False).update({'is_read': True})
    else:
        return jsonify({'error':'Invalid scope'}), 400
    db.session.commit()
    return jsonify({'status':'ok'}), 200
