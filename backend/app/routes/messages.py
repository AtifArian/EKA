from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Doctor, ChatRequest, Chat, Message, Notification
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

# ==================== CHAT REQUESTS ====================

@messages_bp.route('/chat-request/send', methods=['POST'])
@jwt_required()
def send_chat_request():
    """User sends a chat request to a doctor"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    doctor_id = data.get('doctor_id')
    message = data.get('message', '')
    
    if not doctor_id:
        return jsonify({'error': 'Doctor ID is required'}), 400
    
    # Check if doctor exists
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    # Check if user already has pending or accepted request with this doctor
    existing_request = ChatRequest.query.filter(
        ChatRequest.from_user_id == current_user_id,
        ChatRequest.to_doctor_id == doctor_id,
        ChatRequest.status.in_(['pending', 'accepted'])
    ).first()
    
    if existing_request:
        return jsonify({'error': 'You already have an active chat request with this doctor. Please wait for their response or use your existing chat.'}), 400
    
    # Create chat request
    chat_request = ChatRequest(
        from_user_id=current_user_id,
        to_doctor_id=doctor_id,
        message=message,
        status='pending'
    )
    
    db.session.add(chat_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Chat request sent successfully',
        'chat_request': chat_request.to_dict()
    }), 201

@messages_bp.route('/chat-request/<int:request_id>/respond', methods=['POST'])
@jwt_required()
def respond_to_chat_request(request_id):
    """Doctor accepts or rejects a chat request"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    action = data.get('action')  # 'accept' or 'reject'
    
    if action not in ['accept', 'reject']:
        return jsonify({'error': 'Action must be accept or reject'}), 400
    
    chat_request = ChatRequest.query.get(request_id)
    
    if not chat_request:
        return jsonify({'error': 'Chat request not found'}), 404
    
    # Check if the current user is the doctor
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor or doctor.id != chat_request.to_doctor_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if chat_request.status != 'pending':
        return jsonify({'error': 'Chat request is no longer pending'}), 400
    
    if action == 'accept':
        # Update request status
        chat_request.status = 'accepted'
        chat_request.responded_at = datetime.utcnow()
        
        # Create active chat
        chat = Chat(
            user_id=chat_request.from_user_id,
            doctor_id=chat_request.to_doctor_id,
            chat_request_id=chat_request.id,
            status='active'
        )
        
        db.session.add(chat)
        
        # Create notification for the user who sent the chat request
        notification = Notification(
            user_id=chat_request.from_user_id,
            type='chat_request_accepted',
            title='Chat Request Accepted',
            message=f'Your chat request with {doctor.user.full_name or doctor.user.username} has been accepted!',
            related_user_id=current_user_id
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Chat request accepted',
            'chat_request': chat_request.to_dict(),
            'chat': chat.to_dict()
        }), 200
    
    else:  # reject
        chat_request.status = 'rejected'
        chat_request.responded_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Chat request rejected',
            'chat_request': chat_request.to_dict()
        }), 200

@messages_bp.route('/chat-requests/pending', methods=['GET'])
@jwt_required()
def get_pending_chat_requests():
    """Doctor gets all pending chat requests"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user is a doctor
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Only doctors can view pending requests'}), 403
    
    pending_requests = ChatRequest.query.filter_by(
        to_doctor_id=doctor.id,
        status='pending'
    ).order_by(ChatRequest.created_at.desc()).all()
    
    return jsonify({
        'pending_requests': [req.to_dict() for req in pending_requests]
    }), 200

@messages_bp.route('/chat-requests/sent', methods=['GET'])
@jwt_required()
def get_sent_chat_requests():
    """User gets all their sent chat requests"""
    current_user_id = int(get_jwt_identity())
    
    sent_requests = ChatRequest.query.filter_by(
        from_user_id=current_user_id
    ).order_by(ChatRequest.created_at.desc()).all()
    
    return jsonify({
        'sent_requests': [req.to_dict() for req in sent_requests]
    }), 200

# ==================== ACTIVE CHATS ====================

@messages_bp.route('/chats', methods=['GET'])
@jwt_required()
def get_my_chats():
    """Get all active chats for current user or doctor"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user is a doctor
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if doctor:
        # Get chats where this user is the doctor
        chats = Chat.query.filter_by(
            doctor_id=doctor.id,
            status='active'
        ).order_by(Chat.created_at.desc()).all()
    else:
        # Get chats where this user is the patient
        chats = Chat.query.filter_by(
            user_id=current_user_id,
            status='active'
        ).order_by(Chat.created_at.desc()).all()
    
    return jsonify({
        'chats': [chat.to_dict() for chat in chats]
    }), 200

@messages_bp.route('/chats/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat(chat_id):
    """Get a specific chat with all messages"""
    current_user_id = int(get_jwt_identity())
    
    chat = Chat.query.get(chat_id)
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    # Check authorization
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    is_authorized = (chat.user_id == current_user_id) or (doctor and doctor.id == chat.doctor_id)
    
    if not is_authorized:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Mark messages as read
    unread_messages = Message.query.filter_by(
        chat_id=chat_id,
        is_read=False
    ).all()
    
    for msg in unread_messages:
        # Don't mark user's own messages as read by user
        if msg.sender_id != current_user_id:
            msg.is_read = True
    
    db.session.commit()
    
    chat_data = chat.to_dict()
    chat_data['messages'] = [msg.to_dict() for msg in chat.messages]
    
    return jsonify(chat_data), 200

# ==================== MESSAGES ====================

@messages_bp.route('/messages/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message in an active chat"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    chat_id = data.get('chat_id')
    content = data.get('content', '').strip()
    
    if not chat_id or not content:
        return jsonify({'error': 'Chat ID and message content are required'}), 400
    
    chat = Chat.query.get(chat_id)
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    if chat.status != 'active':
        return jsonify({'error': 'Chat is not active'}), 400
    
    # Check authorization
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    is_authorized = (chat.user_id == current_user_id) or (doctor and doctor.id == chat.doctor_id)
    
    if not is_authorized:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Determine sender type
    sender_type = 'doctor' if doctor and doctor.id == chat.doctor_id else 'user'
    
    # Create message
    message = Message(
        chat_id=chat_id,
        sender_id=current_user_id,
        sender_type=sender_type,
        content=content
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'data': message.to_dict()
    }), 201

@messages_bp.route('/chats/<int:chat_id>/end', methods=['POST'])
@jwt_required()
def end_chat(chat_id):
    """End a chat (only doctor can do this)"""
    current_user_id = int(get_jwt_identity())
    
    chat = Chat.query.get(chat_id)
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    # Check if user is the doctor
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor or doctor.id != chat.doctor_id:
        return jsonify({'error': 'Only the doctor can end the chat'}), 403
    
    if chat.status != 'active':
        return jsonify({'error': 'Chat is not active'}), 400
    
    # End the chat
    chat.status = 'ended'
    chat.ended_at = datetime.utcnow()
    chat.ended_by = 'doctor'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Chat ended successfully',
        'chat': chat.to_dict()
    }), 200

@messages_bp.route('/chats/<int:chat_id>/leave', methods=['POST'])
@jwt_required()
def user_leave_chat(chat_id):
    """User leaves a chat"""
    current_user_id = int(get_jwt_identity())
    
    chat = Chat.query.get(chat_id)
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    if chat.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if chat.status != 'active':
        return jsonify({'error': 'Chat is not active'}), 400
    
    # End the chat
    chat.status = 'ended'
    chat.ended_at = datetime.utcnow()
    chat.ended_by = 'user'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Left chat successfully',
        'chat': chat.to_dict()
    }), 200

@messages_bp.route('/messages/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_message_as_read(message_id):
    """Mark a message as read"""
    current_user_id = int(get_jwt_identity())
    
    message = Message.query.get(message_id)
    
    if not message:
        return jsonify({'error': 'Message not found'}), 404
    
    chat = message.chat
    
    # Check authorization
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    is_authorized = (chat.user_id == current_user_id) or (doctor and doctor.id == chat.doctor_id)
    
    if not is_authorized:
        return jsonify({'error': 'Unauthorized'}), 403
    
    message.is_read = True
    db.session.commit()
    
    return jsonify({
        'message': 'Message marked as read',
        'data': message.to_dict()
    }), 200

@messages_bp.route('/chats/<int:chat_id>/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count(chat_id):
    """Get unread message count for a chat"""
    current_user_id = int(get_jwt_identity())
    
    chat = Chat.query.get(chat_id)
    
    if not chat:
        return jsonify({'error': 'Chat not found'}), 404
    
    # Check authorization
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    is_authorized = (chat.user_id == current_user_id) or (doctor and doctor.id == chat.doctor_id)
    
    if not is_authorized:
        return jsonify({'error': 'Unauthorized'}), 403
    
    unread_count = Message.query.filter(
        Message.chat_id == chat_id,
        Message.is_read == False,
        Message.sender_id != current_user_id
    ).count()
    
    return jsonify({
        'unread_count': unread_count
    }), 200
