#!/usr/bin/env python3
"""Migration to create Notification table"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db

def migrate():
    """Create Notification table if it doesn't exist"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if the table exists by querying it
            db.session.execute(db.text("SELECT 1 FROM notification LIMIT 1"))
            print("✓ Notification table already exists")
        except Exception as e:
            print(f"Notification table doesn't exist, creating it...")
            try:
                # Create the table using db.create_all()
                db.create_all()
                print("✓ Successfully created Notification table")
            except Exception as create_error:
                print(f"Error creating table: {create_error}")
                db.session.rollback()
                return False
    
    return True

if __name__ == '__main__':
    success = migrate()
    sys.exit(0 if success else 1)
