"""
Migration script to add follow-up mood fields to MoodEntry table
Run this script to add energy_level, stress_level, and social_connection columns
"""

from app import create_app, db
from sqlalchemy import text

def migrate():
    app = create_app()
    
    with app.app_context():
        engine = db.get_engine()
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        
        print("Starting migration: Adding follow-up mood fields...")
        
        try:
            if db_uri.startswith('sqlite'):
                # SQLite migration
                with engine.connect() as conn:
                    # Check existing columns
                    result = conn.execute(text("PRAGMA table_info('mood_entry')"))
                    columns = [row[1] for row in result.fetchall()]
                    
                    # Add energy_level if not exists
                    if 'energy_level' not in columns:
                        print("Adding energy_level column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN energy_level INTEGER"))
                        conn.commit()
                        print("✓ energy_level added")
                    
                    # Add stress_level if not exists
                    if 'stress_level' not in columns:
                        print("Adding stress_level column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN stress_level INTEGER"))
                        conn.commit()
                        print("✓ stress_level added")
                    
                    # Add social_connection if not exists
                    if 'social_connection' not in columns:
                        print("Adding social_connection column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN social_connection INTEGER"))
                        conn.commit()
                        print("✓ social_connection added")
                        
            elif 'postgresql' in db_uri:
                # PostgreSQL migration
                with engine.connect() as conn:
                    # Check if columns exist
                    result = conn.execute(text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_name='mood_entry'"
                    ))
                    columns = [row[0] for row in result.fetchall()]
                    
                    # Add energy_level if not exists
                    if 'energy_level' not in columns:
                        print("Adding energy_level column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN energy_level INTEGER"))
                        conn.commit()
                        print("✓ energy_level added")
                    
                    # Add stress_level if not exists
                    if 'stress_level' not in columns:
                        print("Adding stress_level column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN stress_level INTEGER"))
                        conn.commit()
                        print("✓ stress_level added")
                    
                    # Add social_connection if not exists
                    if 'social_connection' not in columns:
                        print("Adding social_connection column...")
                        conn.execute(text("ALTER TABLE mood_entry ADD COLUMN social_connection INTEGER"))
                        conn.commit()
                        print("✓ social_connection added")
            
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {str(e)}")
            import traceback
            print(traceback.format_exc())

if __name__ == '__main__':
    migrate()
