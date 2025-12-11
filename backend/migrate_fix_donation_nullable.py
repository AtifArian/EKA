from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        # SQLite doesn't support ALTER COLUMN directly, so we need to recreate the table
        
        # Create a temporary table with correct schema
        db.session.execute(text('''
            CREATE TABLE IF NOT EXISTS donation_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_name VARCHAR(100),
                donor_email VARCHAR(120),
                amount FLOAT NOT NULL,
                currency VARCHAR(10) DEFAULT 'BDT',
                payment_method VARCHAR(50) NOT NULL,
                transaction_id VARCHAR(100),
                phone_number VARCHAR(20),
                message TEXT,
                is_anonymous BOOLEAN DEFAULT 0,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        '''))
        
        # Copy existing data
        db.session.execute(text('''
            INSERT INTO donation_new (id, donor_name, donor_email, amount, currency, payment_method, 
                                     transaction_id, phone_number, message, is_anonymous, status, created_at)
            SELECT id, donor_name, donor_email, amount, currency, payment_method, 
                   transaction_id, phone_number, message, is_anonymous, status, created_at
            FROM donation
        '''))
        
        # Drop old table
        db.session.execute(text('DROP TABLE donation'))
        
        # Rename new table
        db.session.execute(text('ALTER TABLE donation_new RENAME TO donation'))
        
        db.session.commit()
        print("✓ donation table schema updated successfully (donor_name and donor_email are now nullable)")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")
