from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Doctor, ClinicReview, Booking, ChatRequest, User
from datetime import datetime

clinics_bp = Blueprint('clinics', __name__)

@clinics_bp.route('/', methods=['GET'])
@clinics_bp.route('', methods=['GET'])
def get_clinics():
    print("=== GET CLINICS START ===")
    search = request.args.get('search', '')
    specialization = request.args.get('specialization', '')
    sort_by = request.args.get('sort', 'highest')
    print(f"Filters - search: {search}, specialization: {specialization}, sort_by: {sort_by}")
    
    # Get all doctors with profiles
    # Always join with User to get user information
    # Only show doctors with complete profiles
    query = Doctor.query.join(Doctor.user).filter(Doctor.is_profile_complete == True)
    
    # Debug: Print all doctors before filtering
    all_doctors = query.all()
    print(f"Total doctors before filtering: {len(all_doctors)}")
    for doc in all_doctors:
        print(f"Doctor ID: {doc.id}, User ID: {doc.user_id}, User Name: {doc.user.username}, Verified: {doc.is_verified}")
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) | 
            (User.username.ilike(f'%{search}%')) |
            (Doctor.bio.ilike(f'%{search}%'))
        )
    
    if specialization:
        print(f"Filtering by specialization: {specialization}")
        query = query.filter(Doctor.specialization.ilike(f'%{specialization}%'))
    
    doctors = query.all()
    print(f"Found {len(doctors)} doctors after filtering")
    
    # Convert to dict before sorting to avoid multiple calls to average_rating
    doctor_dicts = [doctor.to_dict() for doctor in doctors]
    
    if sort_by == 'highest':
        doctor_dicts = sorted(doctor_dicts, key=lambda d: d.get('average_rating', 0), reverse=True)
    else:
        doctor_dicts = sorted(doctor_dicts, key=lambda d: d.get('average_rating', 0))
    
    print("Final doctors list:", doctor_dicts)
    return jsonify(doctor_dicts), 200

@clinics_bp.route('/<int:doctor_id>', methods=['GET'])
def get_clinic_detail(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    reviews = ClinicReview.query.filter_by(doctor_id=doctor_id).order_by(
        ClinicReview.created_at.desc()
    ).all()
    
    data = doctor.to_dict()
    data['reviews'] = [review.to_dict() for review in reviews]
    
    return jsonify(data), 200

@clinics_bp.route('/<int:doctor_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(doctor_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Get current user
    current_user = User.query.get(current_user_id)
    
    # Prevent doctors from reviewing any clinic
    if current_user.is_doctor:
        return jsonify({'error': 'Doctors cannot review clinics'}), 403
    
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    existing = ClinicReview.query.filter_by(
        doctor_id=doctor_id,
        user_id=current_user_id
    ).first()
    
    if existing:
        return jsonify({'error': 'You have already reviewed this clinic'}), 400
    
    review = ClinicReview(
        doctor_id=doctor_id,
        user_id=current_user_id,
        rating=data['rating'],
        comment=data.get('comment')
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify(review.to_dict()), 201

@clinics_bp.route('/<int:doctor_id>/book', methods=['POST'])
@jwt_required()
def book_session(doctor_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    user = User.query.get(current_user_id)
    
    # Check if payment is required
    requires_payment = user.free_booking_used
    payment_confirmed = data.get('payment_confirmed', False)
    
    if requires_payment and not payment_confirmed:
        return jsonify({
            'requires_payment': True,
            'amount': doctor.session_charge or 0.0,
            'message': 'Payment required for booking'
        }), 402
    
    booking = Booking(
        user_id=current_user_id,
        doctor_id=doctor_id,
        appointment_date=datetime.fromisoformat(data['appointment_date']),
        notes=data.get('notes')
    )
    
    db.session.add(booking)
    
    # Mark free booking as used on first booking
    if not user.free_booking_used:
        user.free_booking_used = True
    
    if user not in doctor.patients:
        doctor.patients.append(user)
    
    db.session.commit()
    
    return jsonify({
        'booking': booking.to_dict(),
        'was_free': not requires_payment
    }), 201

@clinics_bp.route('/<int:doctor_id>/chat-request', methods=['POST'])
@jwt_required()
def send_chat_request(doctor_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    existing = ChatRequest.query.filter_by(
        from_user_id=current_user_id,
        to_doctor_id=doctor_id,
        status='pending'
    ).first()
    
    if existing:
        return jsonify({'error': 'Chat request already pending'}), 400
    
    chat_request = ChatRequest(
        from_user_id=current_user_id,
        to_doctor_id=doctor_id,
        message=data.get('message')
    )
    
    db.session.add(chat_request)
    db.session.commit()
    
    return jsonify(chat_request.to_dict()), 201

@clinics_bp.route('/specializations', methods=['GET'])
def get_specializations():
    specializations = db.session.query(Doctor.specialization).distinct().all()
    return jsonify([s[0] for s in specializations if s[0]]), 200
