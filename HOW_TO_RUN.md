# 🚀 HOW TO RUN THIS PROJECT

## Simple 3-Step Guide

This is the most direct answer to "how to run this project?"

---

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# On Mac/Linux, use:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python create_db.py

# Run database migrations
python migrate_chat_messaging.py
python migrate_email_verification.py

# Start the backend server
python run.py
```

**You should see:**
```
WARNING: This is a development server. Do not use it in production.
Running on http://127.0.0.1:5000/
```

✅ **Keep this terminal open - Backend is running!**

---

## Step 2: Frontend Setup (Terminal 2 - NEW terminal)

```bash
# In new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

**Your browser will automatically open to:**
```
http://localhost:3000
```

✅ **Frontend is running!**

---

## Step 3: You're Done! 🎉

- **Backend:** http://localhost:5000 (API)
- **Frontend:** http://localhost:3000 (Website)

Both are now running and connected!

---

## ⚙️ Before First Run - Setup Gmail (Important!)

To enable email verification for signups:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already done)
3. Click "App passwords" 
4. Select "Mail" → "Windows Computer"
5. Copy the 16-character password
6. Create file `backend/.env` and add:

```env
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=the-16-char-password-you-copied
FLASK_ENV=development
SECRET_KEY=any-secret-string
JWT_SECRET_KEY=any-jwt-secret-string
FRONTEND_URL=http://localhost:3000
DATABASE_URL=sqlite:///eka.db
```

---

## 🧪 Test the Chat System (After Running)

### Create 2 Accounts:

**Account 1 (Regular User):**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill form, enter email, click "Sign up"
4. Check email for verification link (may take few seconds)
5. Click link in email to verify

**Account 2 (Doctor):**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill form
4. **Check the box** "I am a doctor/therapist"
5. Upload any image as verification document
6. Click "Sign up"
7. Verify email

### Test Chat:

**Window 1 (logged in as user):**
- Go to `/clinics`
- Click on doctor
- Click "Request Chat"
- Click "Send Request"
- Go to `/chats`
- See pending request

**Window 2 (logged in as doctor):**
- Go to `/doctor-dashboard`
- See the pending request
- Click "Accept"

**Both Windows:**
- Chat appears in active chats
- Click chat to open
- Send messages
- See real-time updates
- Doctor can click "End Chat" to close

---

## 🆘 Quick Troubleshooting

### Backend won't start?
```bash
# Make sure venv is activated (shows "(venv)" in prompt)
venv\Scripts\activate

# Then try again
python run.py
```

### Port 5000 in use?
```bash
# Kill the process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend won't start?
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
npm start
```

### Port 3000 in use?
```bash
# Kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Email not working?
- Check Gmail password is 16 characters (NOT regular password)
- Check 2-Step Verification is enabled
- Check spam folder
- Restart backend: stop and `python run.py` again

### Chat not showing?
- Refresh browser
- Make sure both users logged in
- Check browser console (F12) for errors

---

## 📁 Project Structure

```
EKA/
├── backend/           # Python Flask API
│   ├── run.py        # Start backend (python run.py)
│   └── requirements.txt
├── frontend/         # React website
│   └── package.json
└── docs/             # This file and guides
```

---

## 🎯 What's Running

| Service | URL | What It Is |
|---------|-----|-----------|
| Backend | http://localhost:5000 | Python Flask API |
| Frontend | http://localhost:3000 | React website |
| Database | eka.db (SQLite) | Stores all data |

---

## 📚 More Information

For more details, see:
- **QUICK_START.md** - Extended setup guide
- **COMPLETE_SETUP_GUIDE.md** - Full documentation with deployment
- **GETTING_STARTED_CHECKLIST.md** - Checklist format
- **DOCUMENTATION_INDEX.md** - All documentation index

---

## ✨ Features You Can Now Use

✅ User signup with email verification
✅ Doctor profiles and verification
✅ Login with email/password
✅ Chat request system
✅ Real-time messaging
✅ Doctor can end chats
✅ Message history
✅ Mood tracking
✅ Journal entries
✅ Articles
✅ Clinic booking

---

## 🎊 That's It!

You're now running the complete EKA project!

**Keep both terminals open while developing.**

### To Stop:
- Press `Ctrl+C` in each terminal

### To Restart:
- Terminal 1: `python run.py`
- Terminal 2: `npm start`

---

**Enjoy! 🚀**
