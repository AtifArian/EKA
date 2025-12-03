"""
Migration script to add free_booking_used field to existing users
Run this once after updating the User model
"""
from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text('ALTER TABLE user ADD COLUMN free_booking_used BOOLEAN DEFAULT 0'))
        db.session.commit()
        print("✓ Successfully added free_booking_used column to user table")
    except Exception as e:
        if "duplicate column name" in str(e).lower():
            print("✓ Column already exists, skipping migration")
        else:
            print(f"Migration completed. Note: {e}")
