from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Doctor
from app.utils.storage import upload_file_to_storage, delete_file_from_storage
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'Invalid JSON request body'}), 400
        
        username = (data.get('username') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        full_name = (data.get('full_name') or '').strip() or None
        is_doctor = bool(data.get('is_doctor', False))
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        if not email or '@' not in email:
            return jsonify({'error': 'A valid email is required'}), 400
        if not password or len(password) < 4:
            return jsonify({'error': 'Password must be at least 4 characters long'}), 400
        
        # Check existing user
        if User.query.filter(db.func.lower(User.email) == email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter(db.func.lower(User.username) == username.lower()).first():
            return jsonify({'error': 'Username already taken'}), 400
        
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            is_doctor=is_doctor
        )
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as commit_err:
            db.session.rollback()
            err_str = str(commit_err).lower()
            if 'truncat' in err_str or 'too long' in err_str or 'stringdata' in err_str:
                from sqlalchemy import text
                engine = db.get_engine()
                with engine.connect() as conn:
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN password_hash TYPE VARCHAR(255)'))
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN username TYPE VARCHAR(120)'))
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN email TYPE VARCHAR(255)'))
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN full_name TYPE VARCHAR(255)'))
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN profile_picture TYPE VARCHAR(500)'))
                    conn.execute(text('ALTER TABLE "user" ALTER COLUMN google_id TYPE VARCHAR(255)'))
                    conn.commit()
                db.session.add(user)
                db.session.commit()
            else:
                raise commit_err
        
        if user.is_doctor:
            doctor = Doctor(
                user_id=user.id,
                is_verified=True,
                specialization=data.get('specialization'),
                bio=data.get('bio'),
                quote=data.get('quote'),
                expertise=data.get('expertise'),
                education=data.get('education'),
                age_group=data.get('age_group'),
                location=data.get('location'),
                latitude=data.get('latitude'),
                longitude=data.get('longitude')
            )
            db.session.add(doctor)
            db.session.commit()
        
        additional_claims = {
            "is_doctor": user.is_doctor
        }
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in signup: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'error': 'Invalid request body'}), 400
        
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter(db.func.lower(User.email) == email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        additional_claims = {
            "is_doctor": user.is_doctor
        }
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in login: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Login failed. Please try again.'}), 500

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    try:
        data = request.get_json(silent=True) or {}
        token = data.get('token')
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            os.environ.get('GOOGLE_CLIENT_ID')
        )
        
        google_id = idinfo['sub']
        email = (idinfo.get('email') or '').strip().lower()
        name = idinfo.get('name')
        
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Check if user with this email already exists
            user = User.query.filter(db.func.lower(User.email) == email).first()
            if user:
                user.google_id = google_id
            else:
                user = User(
                    username=email.split('@')[0],
                    email=email,
                    full_name=name,
                    google_id=google_id,
                    is_doctor=False
                )
                db.session.add(user)
            db.session.commit()
        
        additional_claims = {
            "is_doctor": user.is_doctor
        }
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid Google token'}), 401
    except Exception as e:
        db.session.rollback()
        print(f"Error in google auth: {e}")
        return jsonify({'error': 'Google authentication failed'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        data = request.get_json(silent=True) or {}
        
        # Update user fields
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
            
        # If user is a doctor, update doctor profile
        if user.is_doctor:
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            if not doctor:
                doctor = Doctor(user_id=user.id)
                db.session.add(doctor)
            
            # Update doctor fields
            if 'specialization' in data:
                doctor.specialization = data['specialization']
            if 'bio' in data:
                doctor.bio = data['bio']
            if 'quote' in data:
                doctor.quote = data['quote']
            if 'expertise' in data:
                doctor.expertise = data['expertise']
            if 'education' in data:
                doctor.education = data['education']
            if 'age_group' in data:
                doctor.age_group = data['age_group']
            if 'location' in data:
                doctor.location = data['location']
            if 'latitude' in data and 'longitude' in data:
                doctor.latitude = data['latitude']
                doctor.longitude = data['longitude']
                
        db.session.commit()
        
        response = user.to_dict()
        if user.is_doctor:
            response['doctor_profile'] = doctor.to_dict()
        
        return jsonify(response), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

@auth_bp.route('/verify-doctor', methods=['POST'])
@jwt_required()
def verify_doctor():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user or not user.is_doctor:
            return jsonify({'error': 'Not a doctor account'}), 403
        
        if 'verification_document' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['verification_document']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        doctor = Doctor.query.filter_by(user_id=user.id).first()
        if not doctor:
            doctor = Doctor(user_id=user.id)
            db.session.add(doctor)
            
        if doctor.verification_document:
            delete_file_from_storage(doctor.verification_document)
            
        doc_url = upload_file_to_storage(file, folder='verifications', prefix=f"doc_{user.id}")
        if not doc_url:
            return jsonify({'error': 'Failed to save verification document'}), 500
            
        doctor.verification_document = doc_url
        doctor.is_verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'Verification document uploaded successfully',
            'doctor': doctor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Verification upload failed: {str(e)}'}), 500
