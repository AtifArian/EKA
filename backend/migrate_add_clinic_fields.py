"""
Migration script to add session_charge and google_maps_link fields to Doctor table
Run this once to update the database schema
"""
from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Add session_charge column
        db.session.execute(text(
            "ALTER TABLE doctor ADD COLUMN session_charge FLOAT DEFAULT 0.0"
        ))
        print("✓ Added session_charge column")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("✓ session_charge column already exists")
        else:
            print(f"Error adding session_charge: {e}")
    
    try:
        # Add google_maps_link column
        db.session.execute(text(
            "ALTER TABLE doctor ADD COLUMN google_maps_link VARCHAR(500)"
        ))
        print("✓ Added google_maps_link column")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("✓ google_maps_link column already exists")
        else:
            print(f"Error adding google_maps_link: {e}")
    
    db.session.commit()
    print("\n✅ Migration completed successfully!")
