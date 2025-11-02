from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Doctor
from google.oauth2 import id_token
from google.auth.transport import requests
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data.get('full_name'),
        is_doctor=data.get('is_doctor', False)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    if user.is_doctor:
        doctor = Doctor(
            user_id=user.id,
            is_verified=True,  # Auto-verify for now, you can change this in production
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
    
    access_token = create_access_token(identity=str(user.id))  # Convert to string for JWT
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token with additional claims
    additional_claims = {
        "is_doctor": user.is_doctor
    }
    access_token = create_access_token(
        identity=str(user.id),  # Convert user.id to string
        additional_claims=additional_claims
    )
    print(f"Created token for user {user.id} (is_doctor: {user.is_doctor})")  # DEBUG
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data.get('token')
    
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            os.environ.get('GOOGLE_CLIENT_ID')
        )
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            user = User(
                username=email.split('@')[0],
                email=email,
                full_name=name,
                google_id=google_id,
                is_doctor=False
            )
            db.session.add(user)
            db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json()
    
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

@auth_bp.route('/verify-doctor', methods=['POST'])
@jwt_required()
def verify_doctor():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user or not user.is_doctor:
        return jsonify({'error': 'Not a doctor account'}), 403
    
    if 'verification_document' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['verification_document']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = f"verification_{user.id}_{file.filename}"
    filepath = os.path.join('uploads', 'verifications', filename)
    file.save(filepath)
    
    doctor = Doctor.query.filter_by(user_id=user.id).first()
    doctor.verification_document = filepath
    doctor.is_verified = True  # Set verified to True when document is uploaded
    db.session.commit()
    
    return jsonify({
        'message': 'Verification document uploaded successfully',
        'doctor': doctor.to_dict()
    }), 200
