from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Doctor, ChatRequest  # ← FIXED: Removed DoctorPatient
from app.utils.decorators import doctor_required
from app.utils.suicide_prediction import predict_suicide_risk
from collections import Counter
import traceback

doctors_bp = Blueprint('doctors', __name__)

@doctors_bp.route('/profile', methods=['GET'])
@jwt_required()
@doctor_required
def get_doctor_profile():
    """Get doctor's own profile"""
    try:
        print("=== GET DOCTOR PROFILE START ===")  # DEBUG
        current_user_id = int(get_jwt_identity())
        print(f"User ID: {current_user_id}")  # DEBUG
        
        doctor = Doctor.query.filter_by(user_id=current_user_id).first()
        print(f"Doctor found: {doctor}")  # DEBUG
        
        if not doctor:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        doctor_dict = doctor.to_dict()
        print(f"Doctor dict: {doctor_dict}")  # DEBUG
        
        return jsonify(doctor_dict), 200
        
    except Exception as e:
        print(f"ERROR in get_doctor_profile: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@doctors_bp.route('/profile', methods=['PUT'])
@jwt_required()
@doctor_required
def update_doctor_profile():
    """Update doctor's clinic profile"""
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    
    # Update fields
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
    if 'latitude' in data:
        doctor.latitude = data['latitude']
    if 'longitude' in data:
        doctor.longitude = data['longitude']
    if 'session_charge' in data:
        doctor.session_charge = float(data['session_charge']) if data['session_charge'] else 0.0
    if 'google_maps_link' in data:
        doctor.google_maps_link = data['google_maps_link']
    
    # Check if profile is complete (all required fields filled)
    if (doctor.specialization and doctor.bio and doctor.expertise and 
        doctor.education and doctor.age_group and doctor.session_charge is not None):
        doctor.is_profile_complete = True
    else:
        doctor.is_profile_complete = False
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'doctor': doctor.to_dict()
    }), 200

@doctors_bp.route('/patients', methods=['GET'])
@jwt_required()
@doctor_required
def get_patients():
    """Get doctor's patients with risk scores"""
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    # Get all patients
    patients = []
    for patient in doctor.patients:
        risk_score = predict_suicide_risk(patient.id)
        patient_data = patient.to_dict()
        patient_data['suicide_risk_score'] = risk_score
        patients.append(patient_data)
    
    # Sort by risk score (highest first)
    patients.sort(key=lambda x: x['suicide_risk_score'], reverse=True)
    
    return jsonify(patients), 200

@doctors_bp.route('/patients/<int:patient_id>', methods=['GET'])
@jwt_required()
@doctor_required
def get_patient_detail(patient_id):
    """Get detailed info about a specific patient"""
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    patient = User.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    # Check if this patient belongs to this doctor
    if patient not in doctor.patients:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Build safe summary without exposing journal contents
    risk_score = predict_suicide_risk(patient_id)
    patient_data = patient.to_dict()
    patient_data['suicide_risk_score'] = risk_score

    # Include recent mood entries (no notes)
    patient_data['mood_entries'] = [{
        'id': m.id,
        'mood_level': m.mood_level,
        'date': m.date.isoformat() if m.date else None,
        'created_at': m.created_at.isoformat() if m.created_at else None
    } for m in patient.mood_entries[-30:]]

    # Provide journals summary: id, created_at, emotion only (no title/content)
    recent_journals = patient.journals[-10:]
    patient_data['journal_summary'] = [{
        'id': j.id,
        'emotion': j.emotion,
        'created_at': j.created_at.isoformat() if j.created_at else None
    } for j in recent_journals]

    # Aggregate emotion counts for quick report
    emotion_counts = Counter([j.emotion for j in patient.journals if j.emotion])
    patient_data['emotion_report'] = emotion_counts

    return jsonify(patient_data), 200

@doctors_bp.route('/chat-requests', methods=['GET'])
@jwt_required()
@doctor_required
def get_chat_requests():
    """Get all chat requests for this doctor"""
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404

    chat_requests = ChatRequest.query.filter_by(to_doctor_id=doctor.id).order_by(ChatRequest.created_at.desc()).all()
    
    return jsonify([req.to_dict() for req in chat_requests]), 200

@doctors_bp.route('/chat-requests/<int:request_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_chat_request(request_id):
    """Accept or reject a chat request"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    chat_request = ChatRequest.query.get(request_id)
    if not chat_request:
        return jsonify({'error': 'Chat request not found'}), 404
    
    if chat_request.to_doctor_id != doctor.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    status = data.get('status')  # 'accepted' or 'rejected'
    if status not in ['accepted', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    chat_request.status = status
    
    # If accepted, add patient to doctor's patient list
    if status == 'accepted':
        patient = User.query.get(chat_request.from_user_id)
        
        if patient and patient not in doctor.patients:
            doctor.patients.append(patient)
    
    db.session.commit()
    
    return jsonify({
        'message': f'Chat request {status}',
        'chat_request': chat_request.to_dict()
    }), 200
