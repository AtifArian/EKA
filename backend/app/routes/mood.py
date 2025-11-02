from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app import db
from app.models import MoodEntry, User
import traceback

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/today', methods=['GET'])
@jwt_required()
def check_today_mood():
    """Check if user has logged mood today"""
    try:
        print("=== CHECK TODAY MOOD START ===")  # DEBUG
        current_user_id = int(get_jwt_identity())
        print(f"User ID: {current_user_id}")  # DEBUG
        
        today = datetime.utcnow().date()
        print(f"Today: {today}")  # DEBUG
        
        mood = MoodEntry.query.filter_by(
            user_id=current_user_id,
            date=today
        ).first()
        
        print(f"Mood found: {mood}")  # DEBUG
        
        if mood:
            mood_dict = mood.to_dict()
            print(f"Mood dict: {mood_dict}")  # DEBUG
            return jsonify({
                'has_entry': True,
                'mood': mood_dict
            }), 200
        else:
            return jsonify({
                'has_entry': False,
                'mood': None
            }), 200
            
    except Exception as e:
        print(f"ERROR in check_today_mood: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@mood_bp.route('', methods=['POST'])
@jwt_required()
def create_mood_entry():
    """Create or update today's mood entry"""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        mood_level = data.get('mood_level')
        if not mood_level or mood_level not in [1, 2, 3, 4, 5]:
            return jsonify({'error': 'Invalid mood level (1-5)'}), 400
        
        today = datetime.utcnow().date()
        
        mood = MoodEntry.query.filter_by(
            user_id=current_user_id,
            date=today
        ).first()
        
        if mood:
            mood.mood_level = mood_level
            mood.notes = data.get('notes')
        else:
            mood = MoodEntry(
                user_id=current_user_id,
                mood_level=mood_level,
                date=today,
                notes=data.get('notes')
            )
            db.session.add(mood)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Mood entry saved',
            'mood': mood.to_dict()
        }), 201
        
    except Exception as e:
        print(f"ERROR in create_mood_entry: {str(e)}")
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@mood_bp.route('', methods=['GET'])
@jwt_required()
def get_mood_entries():
    """Get user's mood entries"""
    try:
        current_user_id = int(get_jwt_identity())
        days = request.args.get('days', 30, type=int)
        
        start_date = datetime.utcnow().date() - timedelta(days=days)
        
        moods = MoodEntry.query.filter(
            MoodEntry.user_id == current_user_id,
            MoodEntry.date >= start_date
        ).order_by(MoodEntry.date.desc()).all()
        
        return jsonify([mood.to_dict() for mood in moods]), 200
        
    except Exception as e:
        print(f"ERROR in get_mood_entries: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
