#!/usr/bin/env python3
"""Migration to add missing responded_at column to ChatRequest table"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import ChatRequest

def migrate():
    """Add responded_at column to ChatRequest table if it doesn't exist"""
    app = create_app()
    
    with app.app_context():
        try:
            # Check if the column exists by trying to query it
            db.session.execute(db.text("SELECT responded_at FROM chat_request LIMIT 1"))
            print("✓ Column 'responded_at' already exists in ChatRequest table")
        except Exception as e:
            print(f"Column doesn't exist, creating it...")
            try:
                # Add the column
                db.session.execute(db.text(
                    "ALTER TABLE chat_request ADD COLUMN responded_at DATETIME"
                ))
                db.session.commit()
                print("✓ Successfully added 'responded_at' column to ChatRequest table")
            except Exception as alter_error:
                print(f"Error adding column: {alter_error}")
                db.session.rollback()
                return False
    
    return True

if __name__ == '__main__':
    success = migrate()
    sys.exit(0 if success else 1)
