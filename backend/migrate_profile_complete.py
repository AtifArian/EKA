"""
Migration script to add is_profile_complete field to Doctor table
Run this once to update the database schema
"""
from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Add is_profile_complete column
        db.session.execute(text(
            "ALTER TABLE doctor ADD COLUMN is_profile_complete BOOLEAN DEFAULT 0"
        ))
        print("✓ Added is_profile_complete column")
    except Exception as e:
        if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
            print("✓ is_profile_complete column already exists")
        else:
            print(f"Error adding is_profile_complete: {e}")
    
    db.session.commit()
    
    # Update existing doctor profiles to check if they're complete
    from app.models import Doctor
    doctors = Doctor.query.all()
    
    for doctor in doctors:
        if (doctor.specialization and doctor.bio and doctor.expertise and 
            doctor.education and doctor.age_group and doctor.session_charge is not None):
            doctor.is_profile_complete = True
        else:
            doctor.is_profile_complete = False
    
    db.session.commit()
    print(f"✓ Updated {len(doctors)} doctor profiles")
    print("\n✅ Migration completed successfully!")
