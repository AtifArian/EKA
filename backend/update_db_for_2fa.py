"""
Migration script to add LoginOTP and TrustedDevice tables to existing database
Run this after updating models.py
"""
from app import create_app, db
from app.models import LoginOTP, TrustedDevice

app = create_app()

with app.app_context():
    # Create new tables (won't affect existing tables)
    db.create_all()
    print("✅ Database tables updated successfully!")
    print("✅ Added LoginOTP table for two-factor authentication")
    print("✅ Added TrustedDevice table for remembered devices")
