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
    
    # Load environment variables from backend/.env if present (for local dev)
    try:
        backend_dir = os.path.dirname(app.root_path)  # points to backend/
        load_dotenv(os.path.join(backend_dir, '.env'))
    except Exception:
        pass
    
    # Override config with environment variables for Railway deployment
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', app.config['JWT_SECRET_KEY'])
    
    # Use PostgreSQL in production if DATABASE_URL is set (Railway provides this)
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Railway provides postgres:// but SQLAlchemy needs postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Ensure SQLite path is absolute for local development
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
    
    # CORS configuration - allow frontend from environment variable or defaults
    allowed_origins = [
        "https://eka-eight.vercel.app",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ]
    
    # Add custom frontend URL from environment variable (for Railway/other deployments)
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url and frontend_url not in allowed_origins:
        allowed_origins.append(frontend_url)
    
    # Configure CORS with proper settings for production
    # For local testing with Postman, use origins="*"
    is_local_dev = os.environ.get('FLASK_ENV') == 'development' or not database_url
    
    CORS(app, 
         origins="*" if is_local_dev else allowed_origins,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"],
         supports_credentials=True,
         max_age=3600)
    
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
    
    # Create upload folder - handle potential permission errors in production
    try:
        upload_folder = app.config['UPLOAD_FOLDER']
        # Use absolute path for upload folder
        if not os.path.isabs(upload_folder):
            upload_folder = os.path.abspath(upload_folder)
            app.config['UPLOAD_FOLDER'] = upload_folder
        
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(os.path.join(upload_folder, 'profiles'), exist_ok=True)
        os.makedirs(os.path.join(upload_folder, 'verifications'), exist_ok=True)
        os.makedirs(os.path.join(upload_folder, 'articles'), exist_ok=True)
    except Exception as e:
        print(f"Warning: Could not create upload directories: {e}")
        # In production (Railway), may need to use cloud storage instead
    
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
    
    # Serve uploaded files
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        upload_dir = os.path.abspath(app.config['UPLOAD_FOLDER'])
        return send_from_directory(upload_dir, filename)
    
    # Create tables
    with app.app_context():
        db.create_all()
        # Lightweight migration: ensure 'emotion' column exists on Journal
        try:
            from sqlalchemy import text
            engine = db.get_engine()
            db_uri = app.config['SQLALCHEMY_DATABASE_URI']
            
            if db_uri.startswith('sqlite'):
                with engine.connect() as conn:
                    res = conn.execute(text("PRAGMA table_info('journal')"))
                    cols = [row[1] for row in res.fetchall()]  # name is 2nd col
                    if 'emotion' not in cols:
                        conn.execute(text("ALTER TABLE journal ADD COLUMN emotion VARCHAR(20)"))
                        conn.commit()
            elif 'postgresql' in db_uri:
                # PostgreSQL migration for emotion column
                with engine.connect() as conn:
                    # Check if column exists
                    result = conn.execute(text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_name='journal' AND column_name='emotion'"
                    ))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE journal ADD COLUMN emotion VARCHAR(20)"))
                        conn.commit()
        except Exception as e:
            # Non-fatal; if migration fails, manual migration may be required
            print(f"Warning: Migration failed: {e}")
            pass
    
    return app
