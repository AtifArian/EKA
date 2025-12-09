# 🚀 Complete EKA Project Setup & Run Guide

## Project Overview

**EKA** is a Mental Health & Wellness platform with:
- 🔐 Email verification for secure signup
- 👥 User authentication with JWT tokens
- 📞 Doctor-patient chat system with request flow
- 📝 Journal entries & mood tracking
- 📚 Articles database
- 🏥 Clinic booking system
- 💬 Real-time messaging

## System Requirements

### Prerequisites
- **Python 3.8+** - Backend language
- **Node.js 14+** - Frontend runtime
- **PostgreSQL 12+** or **SQLite** - Database
- **Git** - Version control
- **Gmail Account** - For email verification (optional for local dev)

### Installation Check
```bash
# Check Python
python --version

# Check Node.js
node --version
npm --version
```

## Project Structure

```
EKA/
├── backend/                 # Flask backend
│   ├── app/
│   │   ├── models.py       # Database models
│   │   ├── config.py       # Configuration
│   │   ├── __init__.py     # App initialization
│   │   ├── routes/
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   ├── messages.py # Chat & messaging
│   │   │   ├── doctors.py  # Doctor endpoints
│   │   │   ├── users.py    # User endpoints
│   │   │   ├── clinics.py  # Clinic endpoints
│   │   │   ├── articles.py # Article endpoints
│   │   │   ├── journals.py # Journal endpoints
│   │   │   └── mood.py     # Mood tracking
│   │   └── utils/
│   │       ├── auth.py
│   │       └── email_verification.py
│   ├── requirements.txt     # Python dependencies
│   ├── run.py             # Entry point
│   ├── .env               # Environment variables
│   └── uploads/           # File uploads
├── frontend/              # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   └── App.jsx        # Main app
│   ├── package.json       # Dependencies
│   └── .env               # Frontend config
└── README.md
```

## Step-by-Step Setup

### Step 1: Clone & Navigate to Project

```bash
# Clone the repository
git clone https://github.com/AtifArian/EKA.git
cd EKA

# Navigate to the current branch
git checkout Khan-Tousif-Hossen
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### 2.2 Install Dependencies

```bash
# Make sure you're in backend folder with venv activated
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create or update `backend/.env`:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production

# Database (Choose one)
# For SQLite (default, easy for local dev):
# DATABASE_URL=sqlite:///eka.db

# For PostgreSQL (recommended for production):
DATABASE_URL=postgresql://username:password@localhost:5432/eka_db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=2592000

# Email Verification (Gmail SMTP)
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password-16-chars
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# Server Configuration
FLASK_RUN_PORT=5000
FLASK_RUN_HOST=0.0.0.0
```

**Gmail App Password Setup:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Click "App passwords"
4. Select "Mail" → "Windows Computer"
5. Copy the 16-character password

#### 2.4 Initialize Database

```bash
# Create database tables
python create_db.py

# Run email verification migration (if using new feature)
python migrate_email_verification.py
```

#### 2.5 Start Backend Server

```bash
python run.py

# You should see:
# WARNING: This is a development server. Do not use it in production.
# Running on http://127.0.0.1:5000
```

✅ **Backend is running on `http://localhost:5000`**

---

### Step 3: Frontend Setup

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
# Create frontend/.env:
```

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

#### 3.2 Start Frontend Development Server

```bash
npm start

# Browser will auto-open to http://localhost:3000
```

✅ **Frontend is running on `http://localhost:3000`**

---

## Running the Full Project

Once setup is complete, to run everything:

### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Open in Browser:
```
http://localhost:3000
```

---

## Testing the Messaging Feature

### 1. Create Accounts

**User Account:**
- Go to `/signup`
- Fill in details and sign up
- Verify email (check Gmail inbox)

**Doctor Account:**
- Go to `/signup`
- Check "I am a doctor/therapist"
- Upload verification document
- Verify email

### 2. User Sends Chat Request

- User navigates to `/clinics`
- Clicks on a doctor
- Clicks "Request Chat"
- Enters optional message
- Submits request

### 3. Doctor Accepts Request

- Doctor navigates to `/doctor-dashboard`
- Goes to "Pending Requests" tab
- Views request details
- Clicks "Accept" to start chat

### 4. Start Chatting

- Chat appears in "Active Chats" for both
- User: `/chats` - see and click chat
- Doctor: `/doctor-dashboard` → "Active Chats"
- Both can send messages in real-time

### 5. End Chat

- Only doctor can end chat
- Click "End Chat" button
- Chat status becomes "Ended"
- User can still view chat history

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/signup              Create new account
POST   /api/auth/login               Log in with email/password
POST   /api/auth/verify-email        Verify email with token
POST   /api/auth/resend-verification-email  Resend verification email
```

### Chat Requests
```
POST   /api/messages/chat-request/send           Send chat request to doctor
POST   /api/messages/chat-request/<id>/respond   Accept/reject request
GET    /api/messages/chat-requests/pending       Get pending requests (doctor)
GET    /api/messages/chat-requests/sent          Get sent requests (user)
```

### Chats & Messages
```
GET    /api/messages/chats                  Get user's active chats
GET    /api/messages/chats/<id>            Get specific chat with messages
POST   /api/messages/messages/send          Send message in chat
POST   /api/messages/chats/<id>/end         End chat (doctor only)
POST   /api/messages/chats/<id>/leave       User leaves chat
GET    /api/messages/chats/<id>/unread-count Get unread message count
```

### Users & Doctors
```
GET    /api/users/<id>                Get user profile
GET    /api/doctors                   Get all doctors
GET    /api/doctors/<id>              Get doctor details
```

---

## Database Models

### User
- id, username, email, password_hash, full_name, profile_picture
- is_doctor, google_id, free_booking_used
- is_email_verified, email_verification_token
- created_at

### Doctor
- id, user_id, specialization, bio, quote, expertise
- education, age_group, location, session_charge
- is_profile_complete, is_verified, verification_document

### ChatRequest
- id, from_user_id, to_doctor_id, message
- status (pending/accepted/rejected)
- created_at, responded_at

### Chat
- id, user_id, doctor_id, chat_request_id
- status (active/ended), created_at, ended_at, ended_by

### Message
- id, chat_id, sender_id, sender_type (user/doctor)
- content, is_read, created_at

---

## Troubleshooting

### Backend Won't Start

**Error: "Port 5000 already in use"**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process (replace PID with process ID)
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Error: "ModuleNotFoundError"**
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Make sure venv is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows
```

**Error: "Database connection failed"**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# If using PostgreSQL, ensure it's running:
# macOS:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Use pgAdmin or Services app
```

### Frontend Won't Start

**Error: "npm command not found"**
```bash
# Install Node.js from https://nodejs.org/
# Then verify:
node --version
npm --version
```

**Error: "Port 3000 already in use"**
```bash
# On macOS/Linux:
lsof -i :3000
kill -9 <PID>

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Email Not Being Sent

**Check Gmail credentials:**
```bash
# Verify in .env file:
cat .env | grep GMAIL

# Make sure you're using App Password (16 chars with dashes)
# NOT your regular Gmail password
```

### Chat Messages Not Updating

**Solutions:**
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check browser console for errors: `F12`
3. Verify both users are logged in
4. Check backend logs for API errors

---

## Development Commands

### Backend

```bash
# In backend directory with venv activated

# Start development server
python run.py

# Create database tables
python create_db.py

# Run database migration
python migrate_email_verification.py

# Open Python shell with app context
python -c "from app import create_app; app = create_app(); print('App ready')"
```

### Frontend

```bash
# In frontend directory

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

---

## Deployment

### Deploy Backend (Railway)

1. Push to GitHub
2. Connect repository to Railway
3. Set environment variables
4. Deploy automatically

### Deploy Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy automatically on push

---

## Features Checklist

- [x] User authentication with email verification
- [x] Doctor profiles and verification
- [x] Chat request system
- [x] Real-time messaging
- [x] Doctor can end chats
- [x] Message history
- [x] Unread message tracking
- [x] Mood tracking
- [x] Journal entries
- [x] Articles
- [x] Clinic bookings

---

## Performance Tips

1. **Use PostgreSQL** for production (SQLite is for development)
2. **Enable caching** for doctor profiles
3. **Implement pagination** for large lists
4. **Optimize images** before upload
5. **Use CDN** for static files
6. **Enable CORS** only for trusted origins

---

## Security Best Practices

✅ **Environment Variables** - Never commit .env files
✅ **JWT Tokens** - Store securely, short expiration
✅ **Password Hashing** - Using bcrypt
✅ **Email Verification** - Prevents spam accounts
✅ **HTTPS** - Use in production
✅ **Rate Limiting** - Prevent brute force attacks
✅ **SQL Injection** - Use SQLAlchemy ORM

---

## Getting Help

- Check documentation in `EMAIL_VERIFICATION_SETUP.md`
- Review API endpoints in code comments
- Check browser console for errors: `F12`
- Check backend logs in terminal
- Read error messages carefully

---

## Next Steps

1. ✅ Setup complete - you're ready to develop!
2. 📝 Customize doctor profiles and clinic information
3. 🎨 Style the UI to match your branding
4. 🧪 Write unit and integration tests
5. 🚀 Deploy to production
6. 📊 Monitor and optimize performance

---

**Enjoy building EKA! 🎉**

For questions or issues, check the documentation files or review the code comments.
