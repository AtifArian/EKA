"""
Database migration to add Chat and Message tables for messaging system
This migration creates tables for:
- Chat: Stores active conversations between users and doctors
- Message: Stores individual messages within chats

Also updates ChatRequest to include 'responded_at' timestamp
"""

from app import create_app, db
from app.models import ChatRequest, Chat, Message
from datetime import datetime

def migrate():
    """Run the migration"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Starting database migration for Chat and Message tables...")
        
        try:
            # Check if tables already exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            # Create Chat table if it doesn't exist
            if 'chat' not in existing_tables:
                print("📝 Creating 'chat' table...")
                db.create_all()
                print("✅ 'chat' table created successfully")
            else:
                print("ℹ️  'chat' table already exists, skipping...")
            
            # Create Message table if it doesn't exist
            if 'message' not in existing_tables:
                print("📝 Creating 'message' table...")
                db.create_all()
                print("✅ 'message' table created successfully")
            else:
                print("ℹ️  'message' table already exists, skipping...")
            
            # Check if ChatRequest has responded_at column
            if existing_tables and 'chat_request' in existing_tables:
                chat_request_columns = [col['name'] for col in inspector.get_columns('chat_request')]
                
                if 'responded_at' not in chat_request_columns:
                    print("📝 Adding 'responded_at' column to ChatRequest table...")
                    try:
                        # Add the column
                        db.session.execute('''
                            ALTER TABLE chat_request 
                            ADD COLUMN responded_at TIMESTAMP
                        ''')
                        db.session.commit()
                        print("✅ 'responded_at' column added to ChatRequest")
                    except Exception as e:
                        print(f"ℹ️  'responded_at' column already exists: {str(e)}")
                        db.session.rollback()
                else:
                    print("ℹ️  'responded_at' column already exists in ChatRequest")
            
            print("\n✅ Migration completed successfully!")
            print("🎉 Database schema is now ready for messaging features\n")
            
            # Print schema summary
            print("📊 Current database schema:")
            print(f"   - chat_request table: ✅ Ready")
            print(f"   - chat table: ✅ Ready")
            print(f"   - message table: ✅ Ready")
            print("\n✨ You can now use the messaging system!")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {str(e)}")
            print("Please check your database connection and try again.")
            db.session.rollback()
            return False
    
    return True


def rollback():
    """Rollback the migration (use with caution)"""
    app = create_app()
    
    with app.app_context():
        print("⚠️  Rolling back migration...")
        
        try:
            # Note: This will delete data! Use with extreme caution
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if 'message' in existing_tables:
                print("🗑️  Dropping 'message' table...")
                Message.__table__.drop(db.engine)
                print("✅ 'message' table dropped")
            
            if 'chat' in existing_tables:
                print("🗑️  Dropping 'chat' table...")
                Chat.__table__.drop(db.engine)
                print("✅ 'chat' table dropped")
            
            print("\n✅ Rollback completed!")
            print("⚠️  WARNING: All chat and message data has been deleted!\n")
            
        except Exception as e:
            print(f"\n❌ Rollback failed: {str(e)}")
            return False
    
    return True


if __name__ == "__main__":
    import sys
    
    print("\n" + "="*60)
    print("🚀 EKA - Chat & Messaging Database Migration")
    print("="*60 + "\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback()
    else:
        if migrate():
            sys.exit(0)
        else:
            sys.exit(1)
