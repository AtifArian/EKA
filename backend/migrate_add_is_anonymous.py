from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # Add is_anonymous column to existing donation table
        db.session.execute(text('''
            ALTER TABLE donation ADD COLUMN is_anonymous BOOLEAN DEFAULT 0
        '''))
        db.session.commit()
        print("✓ is_anonymous column added to donation table successfully")
    except Exception as e:
        print(f"Note: {str(e)}")
        print("Column may already exist or table needs to be recreated")
