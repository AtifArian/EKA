from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Doctor, ChatThread, Message, ChatRequest, Notification

messages_bp = Blueprint('messages', __name__)

def emit_notification(user_id, ntype, ref_type=None, ref_id=None):
    n = Notification(user_id=user_id, type=ntype, ref_type=ref_type, ref_id=ref_id)
    db.session.add(n)

@messages_bp.route('/threads/user-user', methods=['POST'])
@jwt_required()
def create_user_user_thread():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    recipient_id = int(data.get('recipient_user_id', 0))
    if not recipient_id or recipient_id == current_user_id:
        return jsonify({'error':'Invalid recipient'}), 400
    # find existing
    thread = ChatThread.query.filter_by(type='user_user', user_id=current_user_id, other_user_id=recipient_id).first()
    if not thread:
        # check reverse
        thread = ChatThread.query.filter_by(type='user_user', user_id=recipient_id, other_user_id=current_user_id).first()
    if not thread:
        thread = ChatThread(type='user_user', user_id=current_user_id, other_user_id=recipient_id)
        db.session.add(thread)
        db.session.commit()
    return jsonify(thread.to_dict()), 201

@messages_bp.route('/threads', methods=['GET'])
@jwt_required()
def list_threads():
    current_user_id = int(get_jwt_identity())
    # Include user-user threads and user-doctor threads for doctors
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    threads = ChatThread.query.filter(
        (ChatThread.user_id == current_user_id) |
        (ChatThread.other_user_id == current_user_id) |
        ((ChatThread.type == 'user_doctor') & ((ChatThread.user_id == current_user_id) | (ChatThread.doctor_id == (doctor.id if doctor else -1))))
    ).order_by(ChatThread.created_at.desc()).all()
    result = []
    for t in threads:
        last = Message.query.filter_by(thread_id=t.id).order_by(Message.created_at.desc()).first()
        unread = Message.query.filter_by(thread_id=t.id, is_read=False).filter(Message.sender_id != current_user_id).count()
        td = t.to_dict()
        td['last_message'] = last.to_dict() if last else None
        td['unread_count'] = unread
        result.append(td)
    return jsonify(result), 200

@messages_bp.route('/threads/<int:thread_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(thread_id):
    current_user_id = int(get_jwt_identity())
    messages = Message.query.filter_by(thread_id=thread_id).order_by(Message.created_at.asc()).all()
    unread = Message.query.filter_by(thread_id=thread_id, is_read=False).filter(Message.sender_id != current_user_id).count()
    return jsonify([m.to_dict() for m in messages]), 200

@messages_bp.route('/threads/<int:thread_id>/messages', methods=['POST'])
@jwt_required()
def post_message(thread_id):
    import traceback
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        # Handle both direct string and nested dict
        content_raw = data.get('content', '')
        if isinstance(content_raw, dict):
            content = content_raw.get('content', '')
        else:
            content = content_raw
        content = str(content).strip()
        if not content:
            return jsonify({'error':'Content required'}), 400
        msg = Message(thread_id=thread_id, sender_id=current_user_id, content=content)
        db.session.add(msg)
        # notify other participant
        thread = ChatThread.query.get(thread_id)
        if thread:
            other_id = None
            if thread.type == 'user_user':
                other_id = thread.other_user_id if thread.user_id == current_user_id else thread.user_id
            elif thread.type == 'user_doctor':
                if thread.user_id == current_user_id:
                    # notify doctor account user_id
                    doctor = Doctor.query.get(thread.doctor_id)
                    other_id = doctor.user_id if doctor else None
                else:
                    # current is doctor; notify patient user
                    other_id = thread.user_id
            if other_id:
                emit_notification(other_id, 'message', ref_type='thread', ref_id=thread_id)
        db.session.commit()
        return jsonify(msg.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print('ERROR in post_message:', str(e))
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/threads/<int:thread_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(thread_id):
    current_user_id = int(get_jwt_identity())
    msgs = Message.query.filter_by(thread_id=thread_id).filter(Message.sender_id != current_user_id).all()
    for m in msgs:
        m.is_read = True
        m.read_at = db.func.now()
    # clear notifications
    Notification.query.filter_by(user_id=current_user_id, type='message', ref_type='thread', ref_id=thread_id).update({'is_read': True})
    db.session.commit()
    return jsonify({'status':'ok'}), 200

@messages_bp.route('/threads/<int:thread_id>', methods=['DELETE'])
@jwt_required()
def delete_thread(thread_id):
    import traceback
    try:
        current_user_id = int(get_jwt_identity())
        thread = ChatThread.query.get(thread_id)
        if not thread:
            return jsonify({'error': 'Thread not found'}), 404
        
        # Verify user is a participant
        doctor = Doctor.query.filter_by(user_id=current_user_id).first()
        is_participant = (
            thread.user_id == current_user_id or
            thread.other_user_id == current_user_id or
            (thread.type == 'user_doctor' and doctor and thread.doctor_id == doctor.id)
        )
        
        if not is_participant:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete associated notifications
        Notification.query.filter_by(ref_type='thread', ref_id=thread_id).delete()
        
        # Delete thread (cascade will delete messages)
        db.session.delete(thread)
        db.session.commit()
        
        return jsonify({'status': 'deleted'}), 200
    except Exception as e:
        db.session.rollback()
        print('ERROR in delete_thread:', str(e))
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
