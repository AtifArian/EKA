from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.models import User

def doctor_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            print("=== DOCTOR REQUIRED CHECK START ===")  # DEBUG
            print(f"Request headers: {dict(request.headers)}")  # DEBUG
            
            # First verify the JWT is valid
            verify_jwt_in_request()
            
            # Get the JWT claims
            claims = get_jwt()
            print(f"JWT claims: {claims}")  # DEBUG
            
            current_user_id = get_jwt_identity()
            print(f"User ID from JWT: {current_user_id}")  # DEBUG
            
            # Convert string ID back to integer
            user_id = int(current_user_id)
            user = User.query.get(user_id)
            print(f"User found: {user}")  # DEBUG
            print(f"Is doctor: {user.is_doctor if user else 'N/A'}")  # DEBUG
            
            if not user or not user.is_doctor:
                print("REJECTED: Not a doctor")  # DEBUG
                return jsonify({'error': 'Doctor access required'}), 403
            
            print("APPROVED: User is doctor")  # DEBUG
            return fn(*args, **kwargs)
        except Exception as e:
            print(f"ERROR in doctor_required: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return jsonify({'error': 'Authorization failed'}), 500
            
    return wrapper
