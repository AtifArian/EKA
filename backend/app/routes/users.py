from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, FriendRequest, Notification
from sqlalchemy import or_
import os

users_bp = Blueprint('users', __name__)

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@users_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
    
    users = User.query.filter(
        or_(
            User.username.ilike(f'%{query}%'),
            User.full_name.ilike(f'%{query}%')
        )
    ).limit(10).all()
    
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/friends', methods=['GET'])
@jwt_required()
def get_friends():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    friends = user.friends.all()
    return jsonify([friend.to_dict() for friend in friends]), 200

@users_bp.route('/friends/<int:friend_id>', methods=['POST'])
@jwt_required()
def send_friend_request(friend_id):
    current_user_id = int(get_jwt_identity())
    
    if current_user_id == friend_id:
        return jsonify({'error': 'Cannot send friend request to yourself'}), 400
    
    user = User.query.get(current_user_id)
    friend = User.query.get(friend_id)
    
    if not friend:
        return jsonify({'error': 'User not found'}), 404
    
    if friend in user.friends:
        return jsonify({'error': 'Already friends'}), 400
    
    # Check if request already exists
    existing_request = FriendRequest.query.filter_by(
        from_user_id=current_user_id,
        to_user_id=friend_id,
        status='pending'
    ).first()
    
    if existing_request:
        return jsonify({'error': 'Friend request already sent'}), 400
    
    # Check if reverse request exists
    reverse_request = FriendRequest.query.filter_by(
        from_user_id=friend_id,
        to_user_id=current_user_id,
        status='pending'
    ).first()
    
    if reverse_request:
        return jsonify({'error': 'This user has already sent you a friend request'}), 400
    
    # Create friend request
    friend_request = FriendRequest(from_user_id=current_user_id, to_user_id=friend_id)
    db.session.add(friend_request)
    
    # Create notification
    notification = Notification(
        user_id=friend_id,
        type='friend_request',
        ref_type='friend_request',
        ref_id=friend_request.id
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({'message': 'Friend request sent'}), 201

@users_bp.route('/friend-requests', methods=['GET'])
@jwt_required()
def get_friend_requests():
    current_user_id = int(get_jwt_identity())
    
    # Get pending requests received by current user
    requests = FriendRequest.query.filter_by(
        to_user_id=current_user_id,
        status='pending'
    ).all()
    
    return jsonify([req.to_dict() for req in requests]), 200

@users_bp.route('/friend-requests/<int:request_id>', methods=['PUT'])
@jwt_required()
def handle_friend_request(request_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    action = data.get('action')  # 'accept' or 'reject'
    
    if action not in ['accept', 'reject']:
        return jsonify({'error': 'Invalid action'}), 400
    
    friend_request = FriendRequest.query.get(request_id)
    
    if not friend_request:
        return jsonify({'error': 'Friend request not found'}), 404
    
    if friend_request.to_user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if friend_request.status != 'pending':
        return jsonify({'error': 'Friend request already handled'}), 400
    
    if action == 'accept':
        # Update request status
        friend_request.status = 'accepted'
        
        # Add bidirectional friendship
        user = User.query.get(current_user_id)
        friend = User.query.get(friend_request.from_user_id)
        
        user.friends.append(friend)
        if user not in friend.friends:
            friend.friends.append(user)
        
        # Notify the requester
        notification = Notification(
            user_id=friend_request.from_user_id,
            type='friend_request_accepted',
            ref_type='user',
            ref_id=current_user_id
        )
        db.session.add(notification)
        
        db.session.commit()
        return jsonify({'message': 'Friend request accepted'}), 200
    else:
        # Reject request
        friend_request.status = 'rejected'
        db.session.commit()
        return jsonify({'message': 'Friend request rejected'}), 200

@users_bp.route('/friends/<int:friend_id>', methods=['DELETE'])
@jwt_required()
def remove_friend(friend_id):
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    friend = User.query.get(friend_id)
    
    if not friend:
        return jsonify({'error': 'User not found'}), 404
    
    if friend not in user.friends:
        return jsonify({'error': 'Not friends'}), 400
    
    # Remove bidirectional friendship
    user.friends.remove(friend)
    # Also remove reverse if exists
    if user in friend.friends:
        friend.friends.remove(user)
    db.session.commit()
    
    return jsonify({'message': 'Friend removed successfully'}), 200

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    # Handle both JSON and form data
    data = request.get_json(silent=True) or {}
    
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    # Handle file upload
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        if file.filename:
            # Delete old profile picture if exists
            if user.profile_picture and os.path.exists(user.profile_picture):
                try:
                    os.remove(user.profile_picture)
                except:
                    pass
            
            filename = f"profile_{user.id}_{file.filename}"
            filepath = os.path.join('uploads', 'profiles', filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            file.save(filepath)
            user.profile_picture = filepath
    
    db.session.commit()
    return jsonify(user.to_dict()), 200

@users_bp.route('/profile-picture', methods=['DELETE'])
@jwt_required()
def delete_profile_picture():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if user.profile_picture:
        # Delete the file from filesystem
        if os.path.exists(user.profile_picture):
            try:
                os.remove(user.profile_picture)
            except Exception as e:
                print(f"Error deleting file: {e}")
        
        # Remove from database
        user.profile_picture = None
        db.session.commit()
        return jsonify({'message': 'Profile picture deleted successfully'}), 200
    
    return jsonify({'error': 'No profile picture to delete'}), 404
