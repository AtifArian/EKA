from app import create_app
from app.models import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    # Create donation table
    db.session.execute(text('''
        CREATE TABLE IF NOT EXISTS donation (
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
    db.session.commit()
    print("✓ donation table created successfully")
