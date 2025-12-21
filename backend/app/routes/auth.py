from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Doctor, LoginOTP, TrustedDevice
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import random
import string
from datetime import datetime, timedelta
import hashlib

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        print(f"\n=== SIGNUP REQUEST ===")
        print(f"Content-Type: {request.content_type}")
        
        # Check if this is a multipart form (for doctor with file) or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            is_doctor = data.get('is_doctor', 'false').lower() == 'true'
            verification_file = request.files.get('verification_document')
            print(f"Multipart form detected - Doctor: {is_doctor}, File: {verification_file.filename if verification_file else 'None'}")
        else:
            data = request.get_json()
            is_doctor = data.get('is_doctor', False)
            verification_file = None
            print(f"JSON request - Doctor: {is_doctor}")
        
        print(f"Email: {data.get('email')}, Username: {data.get('username')}")
        
        if User.query.filter_by(email=data['email']).first():
            print(f"✗ Email already registered: {data['email']}")
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            print(f"✗ Username already taken: {data['username']}")
            return jsonify({'error': 'Username already taken'}), 400
        
        # If user is registering as doctor, verification document is required
        if is_doctor and not verification_file:
            print("✗ Doctor registration requires verification document")
            return jsonify({'error': 'Verification document is required for doctor registration'}), 400
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            full_name=data.get('full_name', ''),
            is_doctor=is_doctor
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        print(f"✓ User created: ID={user.id}, Email={user.email}")
        
        if user.is_doctor:
            print("\n=== CREATING DOCTOR PROFILE ===")
            # Save verification document
            verification_path = None
            if verification_file and verification_file.filename:
                # Create upload directory if it doesn't exist
                upload_dir = os.path.join('uploads', 'verifications')
                os.makedirs(upload_dir, exist_ok=True)
                
                filename = f"verification_{user.id}_{verification_file.filename}"
                filepath = os.path.join(upload_dir, filename)
                verification_file.save(filepath)
                verification_path = filepath
                print(f"✓ Verification document saved: {filepath}")
            
            doctor = Doctor(
                user_id=user.id,
                is_verified=False,  # Not verified until admin approves
                verification_document=verification_path,
                specialization=data.get('specialization'),
                bio=data.get('bio'),
                quote=data.get('quote'),
                expertise=data.get('expertise'),
                education=data.get('education'),
                age_group=data.get('age_group'),
                location=data.get('location'),
                latitude=float(data.get('latitude')) if data.get('latitude') else None,
                longitude=float(data.get('longitude')) if data.get('longitude') else None
            )
            db.session.add(doctor)
            db.session.commit()
            print(f"✓ Doctor profile created for user {user.id}")
        
        access_token = create_access_token(identity=str(user.id))
        print(f"✓ Access token created")
        print(f"=== SIGNUP SUCCESS ===\n")
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'message': 'Account created successfully' + (' - Doctor verification pending' if is_doctor else '')
        }), 201
        
    except Exception as e:
        print(f"\n✗ SIGNUP ERROR: {str(e)}")
        import traceback
        print(traceback.format_exc())
        db.session.rollback()
        return jsonify({'error': f'Signup failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"\n=== LOGIN REQUEST ===")
        print(f"Email: {data.get('email')}")
        print(f"Has device_fingerprint: {bool(data.get('device_fingerprint'))}")
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            print(f"✗ Invalid credentials for {data.get('email')}")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        print(f"✓ User authenticated: {user.id} - {user.email}")
        
        # Get device fingerprint from request
        device_fingerprint = data.get('device_fingerprint', None)
        
        if not device_fingerprint:
            print("⚠ WARNING: No device fingerprint provided, forcing 2FA")
        
        # Check if this device is trusted
        is_trusted_device = False
        if device_fingerprint:
            device_hash = hashlib.sha256(device_fingerprint.encode()).hexdigest()
            print(f"Device hash: {device_hash[:16]}...")
            
            trusted_device = TrustedDevice.query.filter_by(
                user_id=user.id,
                device_fingerprint=device_hash
            ).first()
            
            if trusted_device:
                is_trusted_device = True
                trusted_device.last_used = datetime.utcnow()
                db.session.commit()
                print(f"✓ Trusted device found (last used: {trusted_device.last_used})")
            else:
                print("✗ Device not trusted, requiring 2FA")
        
        # If device is trusted, skip 2FA
        if is_trusted_device:
            # Check if doctor is verified
            is_verified = True
            verification_message = None
            if user.is_doctor:
                doctor = Doctor.query.filter_by(user_id=user.id).first()
                if doctor:
                    is_verified = doctor.is_verified
                    if not is_verified:
                        verification_message = 'Your doctor account is pending verification. You will be notified once approved.'
            
            # Create full access token
            additional_claims = {
                "is_doctor": user.is_doctor,
                "is_verified": is_verified
            }
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims=additional_claims
            )
            
            response = {
                'access_token': access_token,
                'user': user.to_dict(),
                'requires_2fa': False
            }
            
            if verification_message:
                response['message'] = verification_message
            
            return jsonify(response), 200
        
        # Generate 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        print(f"\n=== GENERATING 2FA OTP ===")
        print(f"User: {user.email}")
        print(f"OTP Code: {otp_code}")
        
        # Delete old unused OTPs for this user
        old_otps_count = LoginOTP.query.filter_by(user_id=user.id, is_used=False).delete()
        if old_otps_count > 0:
            print(f"Deleted {old_otps_count} old unused OTPs")
        
        # Create new OTP
        otp = LoginOTP(
            user_id=user.id,
            otp_code=otp_code,
            device_fingerprint=hashlib.sha256(device_fingerprint.encode()).hexdigest() if device_fingerprint else None,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        db.session.add(otp)
        db.session.commit()
        print(f"✓ OTP saved to database (expires: {otp.expires_at})")
        
        # TODO: Send OTP via email (you'll need to configure email service)
        # For now, we'll print it to console for testing
        print(f"\n📧 EMAIL SIMULATION: OTP for {user.email}: {otp_code}\n")
        
        # Create temporary token (short-lived, only for OTP verification)
        temp_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(minutes=15),
            additional_claims={"temp": True}
        )
        print(f"✓ Temporary token created (expires in 15 min)")
        print(f"=== END LOGIN (2FA REQUIRED) ===\n")
        
        return jsonify({
            'requires_2fa': True,
            'temp_token': temp_token,
            'message': f'Verification code sent to {user.email}',
            'otp_for_testing': otp_code  # Remove this in production!
        }), 200
    
    except Exception as e:
        print(f"\n✗ LOGIN ERROR: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
@jwt_required()
def verify_otp():
    """Verify OTP and issue full access token"""
    try:
        print(f"\n=== VERIFY OTP REQUEST ===")
        data = request.get_json()
        otp_code = data.get('otp_code')
        remember_device = data.get('remember_device', False)
        device_fingerprint = data.get('device_fingerprint')
        
        print(f"OTP Code received: {otp_code}")
        print(f"Remember device: {remember_device}")
        print(f"Has device fingerprint: {bool(device_fingerprint)}")
        
        if not otp_code:
            return jsonify({'error': 'OTP code is required'}), 400
        
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"❌ User not found: {current_user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        print(f"User: {user.email} (ID: {user.id})")
        
        # Find valid OTP
        otp = LoginOTP.query.filter_by(
            user_id=user.id,
            otp_code=otp_code,
            is_used=False
        ).first()
        
        if not otp:
            print(f"❌ OTP not found or already used")
            # Check if OTP exists at all
            any_otp = LoginOTP.query.filter_by(user_id=user.id, otp_code=otp_code).first()
            if any_otp:
                print(f"   OTP exists but is_used={any_otp.is_used}")
            return jsonify({'error': 'Invalid or expired OTP'}), 401
        
        if not otp.is_valid():
            print(f"❌ OTP expired (expires_at: {otp.expires_at}, now: {datetime.utcnow()})")
            return jsonify({'error': 'Invalid or expired OTP'}), 401
        
        print(f"✓ OTP is valid")
    
        # Mark OTP as used
        otp.is_used = True
        print(f"✓ OTP marked as used")
        
        # If remember device is checked, save device as trusted
        if remember_device and device_fingerprint:
            device_hash = hashlib.sha256(device_fingerprint.encode()).hexdigest()
            print(f"\n=== SAVING TRUSTED DEVICE ===")
            print(f"Device hash: {device_hash[:16]}...")
            print(f"Device name: {data.get('device_name', 'Unknown Device')}")
            
            # Check if device already exists
            existing_device = TrustedDevice.query.filter_by(
                user_id=user.id,
                device_fingerprint=device_hash
            ).first()
            
            if existing_device:
                print(f"✓ Device already trusted (updating last_used)")
                existing_device.last_used = datetime.utcnow()
            else:
                trusted_device = TrustedDevice(
                    user_id=user.id,
                    device_fingerprint=device_hash,
                    device_name=data.get('device_name', 'Unknown Device'),
                    ip_address=request.remote_addr
                )
                db.session.add(trusted_device)
                print(f"✓ New trusted device saved")
        elif remember_device:
            print(f"⚠ Remember device checked but no device fingerprint provided")
        
        db.session.commit()
        print(f"✓ Database committed")
    
        # Check if doctor is verified
        is_verified = True
        verification_message = None
        if user.is_doctor:
            doctor = Doctor.query.filter_by(user_id=user.id).first()
            if doctor:
                is_verified = doctor.is_verified
                if not is_verified:
                    verification_message = 'Your doctor account is pending verification. You will be notified once approved.'
                    print(f"ℹ Doctor account pending verification")
        
        # Create full access token
        additional_claims = {
            "is_doctor": user.is_doctor,
            "is_verified": is_verified
        }
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        print(f"✓ Full access token created")
        
        response = {
            'access_token': access_token,
            'user': user.to_dict()
        }
        
        if verification_message:
            response['message'] = verification_message
        
        print(f"=== VERIFY OTP SUCCESS ===\n")
        return jsonify(response), 200
    
    except Exception as e:
        print(f"\n❌ VERIFY OTP ERROR: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': 'Verification failed'}), 500

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
