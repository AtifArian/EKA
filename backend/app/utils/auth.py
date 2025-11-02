from functools import wraps
from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User

def debug_token():
    """Debug function to print token information"""
    auth_header = request.headers.get('Authorization')
    print(f"Auth header: {auth_header}")
    
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        print(f"Token found: {token[:10]}...")  # Print first 10 chars for safety
    else:
        print("No valid Bearer token found")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        debug_token()
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated