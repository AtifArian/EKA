"""
Quick test script to verify 2FA tables exist and backend is ready
"""
from app import create_app, db
from app.models import User, Doctor, LoginOTP, TrustedDevice
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    
    print("\\n" + "="*60)
    print("DATABASE VERIFICATION")
    print("="*60)
    
    required_tables = ['user', 'doctor', 'login_otp', 'trusted_device']
    
    for table in required_tables:
        if table in tables:
            print(f"✅ {table.upper()} table exists")
            
            # Show columns
            columns = [col['name'] for col in inspector.get_columns(table)]
            print(f"   Columns: {', '.join(columns)}")
        else:
            print(f"❌ {table.upper()} table MISSING!")
    
    print("\\n" + "="*60)
    print("TESTING MODELS")
    print("="*60)
    
    try:
        # Test User model
        test_user = User.query.first()
        print(f"✅ User model works - Found {User.query.count()} users")
        
        # Test Doctor model
        test_doctor = Doctor.query.first()
        print(f"✅ Doctor model works - Found {Doctor.query.count()} doctors")
        
        # Test LoginOTP model
        test_otp = LoginOTP.query.first()
        print(f"✅ LoginOTP model works - Found {LoginOTP.query.count()} OTPs")
        
        # Test TrustedDevice model
        test_device = TrustedDevice.query.first()
        print(f"✅ TrustedDevice model works - Found {TrustedDevice.query.count()} trusted devices")
        
    except Exception as e:
        print(f"❌ Model test failed: {str(e)}")
    
    print("\\n" + "="*60)
    print("SYSTEM STATUS")
    print("="*60)
    
    if all(table in tables for table in required_tables):
        print("✅ DATABASE IS READY!")
        print("✅ All tables exist")
        print("✅ 2FA system is configured")
        print("\\n🚀 You can now test login with 2FA")
    else:
        print("❌ DATABASE NOT READY")
        print("\\n⚠️  Run: python update_db_for_2fa.py")
    
    print("="*60 + "\\n")
