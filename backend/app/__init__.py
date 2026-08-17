from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from app.models import db, bcrypt
from app.config import Config
import os
from urllib.parse import quote_plus

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Disable strict slashes to prevent 308 redirects that break CORS preflight
    app.url_map.strict_slashes = False
    
    # Load environment variables from backend/.env (local dev & Vercel)
    # Use __file__ based path so it works in both contexts
    try:
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
        load_dotenv(os.path.join(backend_dir, '.env'))
    except Exception:
        pass
    
    # Re-apply config after env vars are loaded (config.py reads PG* at import time,
    # but .env may not have been loaded yet). Rebuild URI if needed.
    pghost = os.environ.get('PGHOST')
    if pghost:
        pguser = os.environ.get('PGUSER', 'postgres')
        pgpassword = quote_plus(os.environ.get('PGPASSWORD', ''))
        pgdatabase = os.environ.get('PGDATABASE', 'postgres')
        pgport = os.environ.get('PGPORT', '5432')
        app.config['SQLALCHEMY_DATABASE_URI'] = (
            f"postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}"
        )
    else:
        # Ensure SQLite path is absolute for local development
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        if db_uri.startswith('sqlite:///') and not db_uri.startswith('sqlite:////'):
            db_file = db_uri.replace('sqlite:///', '')
            abs_db_path = os.path.abspath(os.path.join(backend_dir, db_file))
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{abs_db_path}'
    
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300
    }
    
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
    
    # Add custom frontend URL from environment variable (for Vercel/other deployments)
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url and frontend_url not in allowed_origins:
        allowed_origins.append(frontend_url)
    
    # Configure CORS with proper settings for production
    # For local testing with Postman, use origins="*"
    is_local_dev = os.environ.get('FLASK_ENV') == 'development' or not pghost
    
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
        # In production (Vercel), the filesystem is read-only; use Supabase Storage instead
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.doctors import doctors_bp
    from app.routes.clinics import clinics_bp
    from app.routes.articles import articles_bp
    from app.routes.journals import journals_bp
    from app.routes.mood import mood_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.messages import messages_bp
    from app.routes.notifications import notifications_bp
    from app.routes.donations import donations_bp
    from app.routes.bookings import bookings_bp
    from app.routes.activity import activity_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
    app.register_blueprint(clinics_bp, url_prefix='/api/clinics')
    app.register_blueprint(articles_bp, url_prefix='/api/articles')
    app.register_blueprint(journals_bp, url_prefix='/api/journals')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    app.register_blueprint(chatbot_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(donations_bp, url_prefix='/api')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(activity_bp, url_prefix='/api/activity')
    
    # Serve uploaded files
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        upload_dir = os.path.abspath(app.config['UPLOAD_FOLDER'])
        return send_from_directory(upload_dir, filename)
    
    # Create tables and run schema migrations
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"db.create_all note: {e}")

        try:
            from sqlalchemy import text
            db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
            
            if 'sqlite' in db_uri:
                try:
                    res = db.session.execute(text("PRAGMA table_info('journal')"))
                    cols = [row[1] for row in res.fetchall()]
                    if 'emotion' not in cols:
                        db.session.execute(text("ALTER TABLE journal ADD COLUMN emotion VARCHAR(20)"))
                        db.session.commit()
                except Exception as sq_err:
                    db.session.rollback()
                    print(f"SQLite migration note: {sq_err}")
            elif 'postgresql' in db_uri:
                # Ensure emotion column exists on journal
                try:
                    res = db.session.execute(text(
                        "SELECT column_name FROM information_schema.columns "
                        "WHERE table_name='journal' AND column_name='emotion'"
                    ))
                    if not res.fetchone():
                        db.session.execute(text("ALTER TABLE journal ADD COLUMN emotion TEXT;"))
                        db.session.commit()
                except Exception:
                    db.session.rollback()
        except Exception as e:
            db.session.rollback()
            print(f"Schema migration warning: {e}")
    
    return app
