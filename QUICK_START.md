# ⚡ Quick Start Guide - EKA Messaging System

## 🎯 What This Document Covers
This is a simplified, fast setup guide for the **email verification + chat messaging system**. For detailed setup, see `COMPLETE_SETUP_GUIDE.md`.

---

## ⚡ 30-Second Summary

**EKA** is a mental health platform where:
- Users sign up and verify their email
- Users can request to chat with doctors
- Doctors can accept/reject requests
- Once accepted, they chat in real-time
- Only doctors can end conversations

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# Copy and configure .env file with Gmail credentials
# See COMPLETE_SETUP_GUIDE.md for Gmail setup

python create_db.py
python migrate_chat_messaging.py  # NEW: Chat tables
python run.py
```

**✅ Backend ready on http://localhost:5000**

### Step 2: Frontend Setup (new terminal)
```bash
cd frontend
npm install

# Create .env file with:
# REACT_APP_API_URL=http://localhost:5000/api

npm start
```

**✅ Frontend ready on http://localhost:3000**

---

## 📱 Testing the Chat System

### 1️⃣ Create User Account
- Go to `/signup`
- Enter details and sign up
- **Verify email** (check Gmail inbox for verification link)

### 2️⃣ Create Doctor Account
- Go to `/signup` 
- Check "I am a doctor/therapist"
- Upload verification document
- **Verify email**

### 3️⃣ User Sends Chat Request
- User logs in
- Go to `/clinics`
- Click a doctor
- Click "Request Chat"
- Click "Send Request"

### 4️⃣ Doctor Accepts
- Doctor logs in
- Go to `/doctor-dashboard`
- See pending request
- Click "Accept"

### 5️⃣ Chat Now Active
- Both see chat in active conversations
- User: go to `/chats`
- Doctor: see in `/doctor-dashboard`
- **Start messaging!**

### 6️⃣ Doctor Ends Chat
- Doctor clicks "End Chat"
- Chat becomes inactive
- User can still view history

---

## 🗂️ Key Files Added

| File | Purpose |
|------|---------|
| `backend/app/routes/messages.py` | Chat API endpoints (12 endpoints) |
| `backend/migrate_chat_messaging.py` | Create Chat & Message tables |
| `frontend/src/services/messages.js` | API client for messaging |
| `frontend/src/components/ChatInterface.jsx` | Chat UI component |
| `frontend/src/components/SendChatRequest.jsx` | Request form component |
| `frontend/src/pages/MyChats.jsx` | User's chat list page |
| `frontend/src/pages/DoctorDashboard.jsx` | Doctor's management page |
| `COMPLETE_SETUP_GUIDE.md` | Full setup documentation |

---

## 🔑 Key Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
DATABASE_URL=sqlite:///eka.db
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:3000
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🐛 Common Issues

### "Email verification not working"
- Make sure Gmail credentials are correct in `.env`
- Use 16-character App Password (NOT your regular Gmail password)
- Gmail account needs 2-Step Verification enabled
- Check spam folder

### "Chat not appearing"
- Refresh the page
- Make sure both users are logged in
- Check browser console for errors (F12)

### "Port already in use"
```bash
# Windows - find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### "Backend won't start"
```bash
# Make sure venv is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📊 Database Schema

### Chat Table
```sql
- id (primary key)
- user_id (FK → User)
- doctor_id (FK → User)
- chat_request_id (FK → ChatRequest)
- status (active/ended)
- created_at
- ended_at
- ended_by (user/doctor)
```

### Message Table
```sql
- id (primary key)
- chat_id (FK → Chat)
- sender_id (FK → User)
- sender_type (user/doctor)
- content (text)
- is_read (boolean)
- created_at
```

### ChatRequest Table
```sql
- id (primary key)
- from_user_id (FK → User)
- to_doctor_id (FK → User)
- message (optional text)
- status (pending/accepted/rejected)
- created_at
- responded_at
```

---

## 🔗 API Endpoints

### Chat Requests
```
POST   /api/messages/chat-request/send
POST   /api/messages/chat-request/<id>/respond
GET    /api/messages/chat-requests/pending
GET    /api/messages/chat-requests/sent
```

### Chats & Messages
```
GET    /api/messages/chats
GET    /api/messages/chats/<id>
POST   /api/messages/messages/send
POST   /api/messages/chats/<id>/end
POST   /api/messages/chats/<id>/leave
```

---

## 🎓 Project Architecture

```
User Signs Up
    ↓
Email Verification
    ↓
User Logged In
    ↓
User Sends Chat Request to Doctor
    ↓
Doctor Accepts Request ← Doctor Rejects
    ↓
Chat Created & Active
    ↓
Both Can Send Messages (real-time)
    ↓
Doctor Can End Chat
    ↓
Chat Becomes Inactive (history preserved)
```

---

## ✨ Features

✅ Email verification (Gmail SMTP)
✅ User authentication (JWT)
✅ Chat request system
✅ Real-time messaging
✅ Doctor can end chats
✅ Message history
✅ Unread tracking
✅ Doctor profiles
✅ Mood tracking
✅ Journal entries
✅ Articles
✅ Clinic bookings

---

## 🚀 Next Steps

1. **Run the project** - Follow Quick Setup above
2. **Test the chat system** - Follow Testing guide
3. **Customize** - Update colors, text, styles
4. **Deploy** - Push to Vercel (frontend) & Railway (backend)
5. **Monitor** - Check logs and user feedback

---

## 📖 Full Documentation

See `COMPLETE_SETUP_GUIDE.md` for:
- Detailed environment setup
- Gmail configuration
- Deployment instructions
- Troubleshooting guide
- Performance tips
- Security best practices

---

## 💡 Tips & Tricks

- **Auto-refresh chats** - Messages update every 2-3 seconds (polling)
- **Keep backend running** - Terminal 1 for backend, Terminal 2 for frontend
- **Test with 2 browsers** - Open user account in one, doctor in another
- **Check network tab** - See API calls in browser DevTools
- **Backend logs** - Check terminal where `python run.py` is running

---

## ❓ Need Help?

1. Check `COMPLETE_SETUP_GUIDE.md` for detailed instructions
2. Review code comments in component files
3. Check browser console: `F12` → Console tab
4. Check backend terminal for error messages
5. Verify database connection: Check `.env` DATABASE_URL

---

**Ready to build! 🎉**
