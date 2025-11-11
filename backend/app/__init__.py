from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from app.models import db, bcrypt
from app.config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Disable strict slashes to prevent 308 redirects that break CORS preflight
    app.url_map.strict_slashes = False
    
    # Load environment variables from backend/.env if present
    try:
        backend_dir = os.path.dirname(app.root_path)  # points to backend/
        load_dotenv(os.path.join(backend_dir, '.env'))
    except Exception:
        pass
    
    # Ensure SQLite path is absolute so running from different CWDs is safe
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if db_uri.startswith('sqlite:///') and not db_uri.startswith('sqlite:////'):
        # Convert to absolute path relative to backend folder
        backend_dir = os.path.dirname(app.root_path)  # points to backend/
        db_file = db_uri.replace('sqlite:///', '')
        abs_db_path = os.path.abspath(os.path.join(backend_dir, db_file))
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{abs_db_path}'
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})
    jwt = JWTManager(app)
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"Invalid token error: {error}")  # DEBUG
        return {"error": "Invalid token", "details": str(error)}, 422
        
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        print(f"Expired token: {jwt_header}, {jwt_data}")  # DEBUG
        return {"error": "Token has expired"}, 422
        
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"Missing token: {error}")  # DEBUG
        return {"error": "Missing token"}, 422
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'profiles'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'verifications'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'articles'), exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.doctors import doctors_bp
    from app.routes.clinics import clinics_bp
    from app.routes.articles import articles_bp
    from app.routes.journals import journals_bp
    from app.routes.mood import mood_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(clinics_bp, url_prefix='/api/clinics')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(journals_bp, url_prefix='/api/journals')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    
    # Create tables
    with app.app_context():
        db.create_all()
        # Lightweight migration: ensure 'emotion' column exists on Journal
        try:
            from sqlalchemy import text
            engine = db.get_engine()
            if app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite'):
                with engine.connect() as conn:
                    res = conn.execute(text("PRAGMA table_info('journal')"))
                    cols = [row[1] for row in res.fetchall()]  # name is 2nd col
                    if 'emotion' not in cols:
                        conn.execute(text("ALTER TABLE journal ADD COLUMN emotion VARCHAR(20)"))
        except Exception as _:
            # Non-fatal; if migration fails, manual migration may be required
            pass
    
    return app
