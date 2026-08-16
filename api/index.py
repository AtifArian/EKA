"""
Vercel Serverless Function entry point.

This wraps the Flask application as a WSGI-compatible handler.
Vercel's @vercel/python runtime auto-detects a variable named `app`
that is a WSGI application (Flask, Django, etc.).

All /api/* routes are routed here via vercel.json.
"""

import os
import sys

# Add the project root to the Python path so that `backend.app` can be imported
# when Vercel runs this from the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(project_root, 'backend')

# Add both root and backend to path
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load backend .env (Vercel sets env vars via dashboard, but this helps local testing)
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))

from app import create_app

app = create_app()
