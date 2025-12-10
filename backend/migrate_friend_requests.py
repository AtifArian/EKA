from app import create_app
from app.models import db

app = create_app()

with app.app_context():
    # Create friend_request table
    db.engine.execute('''
        CREATE TABLE IF NOT EXISTS friend_request (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_user_id) REFERENCES user(id),
            FOREIGN KEY (to_user_id) REFERENCES user(id)
        )
    ''')
    print("✓ friend_request table created successfully")
