from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Booking, User, Doctor
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    """Get all bookings for the logged-in patient"""
    current_user_id = int(get_jwt_identity())
    
    bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.appointment_date.desc()).all()
    
    return jsonify([booking.to_dict() for booking in bookings]), 200

@bookings_bp.route('/my-sessions', methods=['GET'])
@jwt_required()
def get_my_sessions():
    """Get all session bookings for the logged-in doctor"""
    current_user_id = int(get_jwt_identity())
    
    # Get the doctor profile for this user
    user = User.query.get(current_user_id)
    if not user or not user.is_doctor:
        return jsonify({'error': 'Not authorized'}), 403
    
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    bookings = Booking.query.filter_by(doctor_id=doctor.id).order_by(Booking.appointment_date.desc()).all()
    
    return jsonify([booking.to_dict() for booking in bookings]), 200

@bookings_bp.route('/<int:booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking"""
    current_user_id = int(get_jwt_identity())
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    # Check if user is authorized to cancel (patient or doctor)
    user = User.query.get(current_user_id)
    doctor = Doctor.query.filter_by(user_id=current_user_id).first() if user.is_doctor else None
    
    if booking.user_id != current_user_id and (not doctor or booking.doctor_id != doctor.id):
        return jsonify({'error': 'Not authorized'}), 403
    
    booking.status = 'cancelled'
    db.session.commit()
    
    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<int:booking_id>/complete', methods=['PUT'])
@jwt_required()
def complete_booking(booking_id):
    """Mark a booking as completed (doctors only)"""
    current_user_id = int(get_jwt_identity())
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    # Check if user is the doctor for this booking
    user = User.query.get(current_user_id)
    if not user or not user.is_doctor:
        return jsonify({'error': 'Not authorized'}), 403
    
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor or booking.doctor_id != doctor.id:
        return jsonify({'error': 'Not authorized'}), 403
    
    booking.status = 'completed'
    db.session.commit()
    
    return jsonify(booking.to_dict()), 200

@bookings_bp.route('/<int:booking_id>/confirm', methods=['PUT'])
@jwt_required()
def confirm_booking(booking_id):
    """Confirm a booking (doctors only)"""
    current_user_id = int(get_jwt_identity())
    
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    # Check if user is the doctor for this booking
    user = User.query.get(current_user_id)
    if not user or not user.is_doctor:
        return jsonify({'error': 'Not authorized'}), 403
    
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor or booking.doctor_id != doctor.id:
        return jsonify({'error': 'Not authorized'}), 403
    
    booking.status = 'confirmed'
    db.session.commit()
    
    return jsonify(booking.to_dict()), 200
