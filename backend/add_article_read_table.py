"""
Migration script to add article_read table to existing database
Run this script to update your database with activity tracking features
"""
import sqlite3
import os

# Path to your database
DB_PATH = 'mental_wellness.db'

def migrate():
    if not os.path.exists(DB_PATH):
        print("❌ Database not found. Please run the application first to create the database.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='article_read'
        """)
        
        if cursor.fetchone():
            print("✅ article_read table already exists!")
            return
        
        # Create article_read table
        print("Creating article_read table...")
        cursor.execute("""
            CREATE TABLE article_read (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                article_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES user (id),
                FOREIGN KEY (article_id) REFERENCES article (id),
                UNIQUE(user_id, article_id, DATE(created_at))
            )
        """)
        
        # Create index for faster queries
        cursor.execute("""
            CREATE INDEX idx_article_read_created_at 
            ON article_read (created_at)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_article_read_user 
            ON article_read (user_id)
        """)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("✅ article_read table created with indexes")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 60)
    print("Database Migration: Adding Activity Tracking")
    print("=" * 60)
    migrate()
    print("=" * 60)
