from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Notification, User

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all unread notifications for current user"""
    current_user_id = int(get_jwt_identity())
    
    notifications = Notification.query.filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).all()
    
    return jsonify([notif.to_dict() for notif in notifications]), 200

@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notif_id):
    """Mark a notification as read"""
    current_user_id = int(get_jwt_identity())
    
    notification = Notification.query.get(notif_id)
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    if notification.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Notification marked as read'}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    """Mark all notifications as read"""
    current_user_id = int(get_jwt_identity())
    
    Notification.query.filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).update({Notification.is_read: True})
    
    db.session.commit()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

@notifications_bp.route('/count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications"""
    current_user_id = int(get_jwt_identity())
    
    count = Notification.query.filter(
        Notification.user_id == current_user_id,
        Notification.is_read == False
    ).count()
    
    return jsonify({'unread_count': count}), 200
