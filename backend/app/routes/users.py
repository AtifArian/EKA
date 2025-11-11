from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User
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
def add_friend(friend_id):
    current_user_id = int(get_jwt_identity())
    
    if current_user_id == friend_id:
        return jsonify({'error': 'Cannot add yourself as friend'}), 400
    
    user = User.query.get(current_user_id)
    friend = User.query.get(friend_id)
    
    if not friend:
        return jsonify({'error': 'User not found'}), 404
    
    if friend in user.friends:
        return jsonify({'error': 'Already friends'}), 400
    
    user.friends.append(friend)
    db.session.commit()
    
    return jsonify({'message': 'Friend added successfully'}), 200

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
    
    user.friends.remove(friend)
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
