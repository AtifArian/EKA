# 🚀 HOW TO RUN THE PROJECT

## Quick Start (5 minutes)

### Terminal 1: Run Backend

```bash
cd backend
python run.py
```

You should see:
```
WARNING in app.run_simple: This is a development server
Running on http://127.0.0.1:5000
```

### Terminal 2: Run Frontend

```bash
cd frontend
npm start
```

Browser will open automatically to `http://localhost:3000`

That's it! You can now:
- Sign up / Login
- Browse doctors at `/doctors`
- Send chat requests
- Chat with doctors

---

## Full Setup (First Time)

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Create .env file with these variables:
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost/eka_db
JWT_SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GMAIL_EMAIL=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# Run database migration
python migrate_email_verification.py

# Start server
python run.py
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Create .env file:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Start frontend
npm start
```

---

## 🧪 Test the Chat System

### Create Test Accounts:

**User Account:**
1. Go to http://localhost:3000/signup
2. Fill in form (verify email if required)
3. Login

**Doctor Account:**
1. Go to http://localhost:3000/signup
2. Fill in form
3. Check "I am a doctor/therapist"
4. Upload verification document
5. Login and complete doctor profile

### Test Chat Flow:

```
1. Login as User
2. Click "💬 Chat Doctors" in navbar
3. Click "Request Chat" on a doctor
4. Click "Send" with optional message

5. In new browser/incognito window:
   - Login as Doctor
   - Click "👨‍⚕️ Dashboard"
   - See pending request
   - Click "Accept"

6. Back to User window:
   - Go to "📧 My Chats"
   - See request changed to "ACCEPTED"
   - Click on chat
   - Send message

7. Doctor receives message instantly
8. Doctor can reply or end chat
```

---

## 🔧 Environment Setup

### Gmail Configuration (for email verification)

```
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Generate "App Password"
4. Copy 16-character password
5. Add to backend/.env:
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Google OAuth (optional)

```
1. Go to https://console.cloud.google.com
2. Create OAuth credentials
3. Copy Client ID
4. Add to both .env files:
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Database Setup

```
1. Install PostgreSQL
2. Create database: eka_db
3. Add to backend/.env:
   DATABASE_URL=postgresql://user:password@localhost/eka_db
```

---

## 📍 Main Pages

| Page | URL | For Whom |
|------|-----|---------|
| Home | `/` | Everyone |
| Chat Doctors | `/doctors` | Users |
| My Chats | `/chats` | Users |
| Doctor Dashboard | `/doctor-dashboard` | Doctors |
| My Profile | `/profile` | Everyone |
| Clinics | `/clinics` | Everyone |
| Articles | `/articles` | Everyone |
| Journals | `/journals` | Everyone |

---

## 🎯 Features

### Users Can:
- ✅ Browse all doctors
- ✅ View doctor profiles
- ✅ Send chat request with message
- ✅ See request status
- ✅ Chat once doctor accepts
- ✅ See chat history
- ✅ Email verification before login

### Doctors Can:
- ✅ Complete profile
- ✅ See pending chat requests
- ✅ Accept or decline requests
- ✅ Chat with users
- ✅ End conversations
- ✅ See all active chats

---

## 🐛 Debugging

**Backend not starting?**
```bash
# Check Python version
python --version

# Reinstall packages
pip install -r requirements.txt --force-reinstall

# Check database connection
psql -U username -d eka_db -c "SELECT 1"
```

**Frontend errors?**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check port 3000 is free
# Windows: netstat -ano | findstr :3000
# Mac: lsof -i :3000
```

**Components not found?**
```bash
# Make sure files exist:
ls frontend/src/pages/Doctors.jsx
ls frontend/src/pages/EmailVerification.jsx
ls frontend/src/pages/ResendVerification.jsx
```

**API calls failing?**
```
- Open DevTools (F12)
- Check Network tab
- Look for red requests
- Check backend logs for errors
```

---

## 📱 Screenshots/Features Overview

### User Workflow:
1. **Chat Doctors Page** - Browse and search doctors
2. **Send Request Modal** - Add optional message
3. **My Chats Page** - Track requests and active chats
4. **Chat Interface** - Real-time messaging

### Doctor Workflow:
1. **Dashboard** - See pending requests
2. **Accept/Decline** - Manage requests
3. **Chat Interface** - Talk with users
4. **End Chat** - Close conversation

---

## 💾 Database Tables

```sql
-- User table (existing, with new fields)
ALTER TABLE user ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user ADD COLUMN email_verification_token VARCHAR(255) UNIQUE;

-- Chat Request table (existing)
CREATE TABLE chat_request (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER,
  to_doctor_id INTEGER,
  message TEXT,
  status VARCHAR(20), -- pending, accepted, declined
  created_at TIMESTAMP,
  responded_at TIMESTAMP
);

-- Chat table (existing)
CREATE TABLE chat (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  doctor_id INTEGER,
  status VARCHAR(20), -- active, ended
  created_at TIMESTAMP,
  ended_at TIMESTAMP
);

-- Message table (existing)
CREATE TABLE message (
  id INTEGER PRIMARY KEY,
  chat_id INTEGER,
  sender_id INTEGER,
  content TEXT,
  created_at TIMESTAMP
);
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill process: `lsof -i :5000 \| kill -9 <PID>` |
| Port 3000 already in use | Kill process: `lsof -i :3000 \| kill -9 <PID>` |
| Module not found | Run: `npm install` in frontend folder |
| Database connection error | Check DATABASE_URL in .env |
| Email not sending | Check Gmail credentials and 2-Step Verification |
| CORS error | Check FRONTEND_URL in backend .env |

---

## 📞 Support

1. Check the **COMPLETE_CHAT_GUIDE.md** for detailed documentation
2. Check backend/frontend terminal for error messages
3. Open browser DevTools (F12) to see console errors
4. Check Network tab to see API requests
5. Review .env files for missing variables

---

## ✅ Checklist

Before running:
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] .env files created with all variables
- [ ] Database set up and accessible
- [ ] Port 5000 and 3000 are free
- [ ] Gmail configured (if using email verification)

While running:
- [ ] Backend server showing "Running on..."
- [ ] Frontend starts without compilation errors
- [ ] Can access http://localhost:3000
- [ ] Can sign up / login
- [ ] Can browse doctors at /doctors
- [ ] Can send chat requests

---

**You're all set! Enjoy the chat system!** 🎉
