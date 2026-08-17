import os
from datetime import timedelta
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env file from backend directory if present
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(backend_dir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Build database URI from PG* env vars (Supabase), fall back to SQLite
    PGHOST = os.environ.get('PGHOST')
    if PGHOST:
        PGUSER = os.environ.get('PGUSER', 'postgres')
        PGPASSWORD = quote_plus(os.environ.get('PGPASSWORD', ''))
        PGDATABASE = os.environ.get('PGDATABASE', 'postgres')
        PGPORT = os.environ.get('PGPORT', '5432')
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
        )
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///mental_wellness.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
