# 🎯 QUICK REFERENCE CARD

## RUN THE PROJECT IN 3 STEPS

### Step 1: Backend (Terminal 1)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python create_db.py
python migrate_chat_messaging.py
python run.py
```
✅ Running at http://localhost:5000

### Step 2: Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```
✅ Running at http://localhost:3000

### Step 3: Test It!
1. Sign up → Verify email
2. Sign up as doctor → Verify email
3. User sends request
4. Doctor accepts
5. Chat together!

---

## WHAT YOU GOT

### Backend
- `app/routes/messages.py` - 12 chat API endpoints
- `migrate_chat_messaging.py` - Database setup
- Chat, Message models - Database tables

### Frontend
- `MyChats.jsx` - User chat page
- `DoctorDashboard.jsx` - Doctor request manager
- `ChatInterface.jsx` - Real-time chat
- `SendChatRequest.jsx` - Request form
- `messages.js` - API client
- CSS styling - Professional UI

### Documentation
- `HOW_TO_RUN.md` - This is your main guide
- `QUICK_START.md` - Extended setup
- `COMPLETE_SETUP_GUIDE.md` - Full details
- `GETTING_STARTED_CHECKLIST.md` - Step-by-step
- `IMPLEMENTATION_SUMMARY.md` - Architecture
- `DOCUMENTATION_INDEX.md` - All docs

---

## API ENDPOINTS (12 Total)

**Send Request:**
```
POST /api/messages/chat-request/send
```

**Respond to Request:**
```
POST /api/messages/chat-request/<id>/respond
```

**Get Pending Requests:**
```
GET /api/messages/chat-requests/pending
```

**Get All Chats:**
```
GET /api/messages/chats
```

**Get Chat Messages:**
```
GET /api/messages/chats/<id>
```

**Send Message:**
```
POST /api/messages/messages/send
```

**End Chat:**
```
POST /api/messages/chats/<id>/end
```

See complete list in documentation.

---

## ROUTES

| Route | Purpose | User |
|-------|---------|------|
| `/` | Homepage | Everyone |
| `/signup` | Sign up | Everyone |
| `/login` | Log in | Everyone |
| `/chats` | View chats | User |
| `/doctor-dashboard` | Manage requests | Doctor |
| `/clinics` | Find doctors | Everyone |

---

## TROUBLESHOOTING

**Backend won't start?**
```
venv\Scripts\activate
python run.py
```

**Port 5000 in use?**
```
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend won't load?**
```
npm install
npm start
```

**Port 3000 in use?**
```
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Email not working?**
- Check Gmail app password (16 chars)
- Check 2-Step Verification enabled
- Check spam folder

**Chat not showing?**
- Refresh browser
- Both users logged in
- Press F12 for console errors

---

## DATABASE

**Stored in:** `backend/eka.db` (SQLite)

**Tables:**
- Users - All users
- Doctors - Doctor info
- ChatRequest - Requests between users
- Chat - Active conversations
- Message - Individual messages

**Access:**
```python
# To see database, use SQLite viewer
# Or check backend logs for errors
```

---

## FEATURES

✅ User signup with email verification
✅ Doctor profiles and verification
✅ Chat request system
✅ Real-time messaging
✅ Doctor can end chats
✅ Message history
✅ Unread tracking
✅ Mood tracking
✅ Journals
✅ Articles
✅ Clinic booking

---

## FILES SUMMARY

```
Backend (New/Modified)
├── routes/messages.py          ✨ New - 12 endpoints
├── models.py                   🔄 Updated - Chat, Message
└── __init__.py                 🔄 Updated - Blueprint registration

Frontend (New/Modified)
├── pages/
│   ├── MyChats.jsx             ✨ New - User chat list
│   └── DoctorDashboard.jsx     ✨ New - Doctor requests
├── components/
│   ├── ChatInterface.jsx       ✨ New - Chat UI
│   └── SendChatRequest.jsx     ✨ New - Request form
├── services/
│   └── messages.js             ✨ New - API client
├── styles/
│   ├── ChatInterface.css       ✨ New - Chat styling
│   ├── MyChats.css             ✨ New - MyChats styling
│   └── DoctorDashboard.css     ✨ New - Dashboard styling
└── App.jsx                     🔄 Updated - Routes

Migrations
└── migrate_chat_messaging.py   ✨ New - Create tables

Documentation
├── HOW_TO_RUN.md               ⭐ Start here
├── QUICK_START.md
├── COMPLETE_SETUP_GUIDE.md
├── GETTING_STARTED_CHECKLIST.md
├── IMPLEMENTATION_SUMMARY.md
└── DOCUMENTATION_INDEX.md
```

---

## GMAIL SETUP (One-Time)

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Get App Password (Mail, Windows)
4. Copy 16-character password
5. Add to `backend/.env`:
   ```env
   GMAIL_EMAIL=your-email@gmail.com
   GMAIL_PASSWORD=16-char-password
   ```

---

## ENVIRONMENT VARIABLES

**Backend (.env):**
```
FLASK_ENV=development
DATABASE_URL=sqlite:///eka.db
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-16-char-password
FRONTEND_URL=http://localhost:3000
SECRET_KEY=any-secret-key
JWT_SECRET_KEY=any-jwt-secret
```

**Frontend (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## TECH STACK

- **Backend:** Flask (Python)
- **Frontend:** React (JavaScript)
- **Database:** SQLite / PostgreSQL
- **Auth:** JWT tokens
- **Email:** Gmail SMTP
- **HTTP:** Axios

---

## KEY COMMANDS

**Backend:**
```bash
python -m venv venv       # Create env
venv\Scripts\activate     # Activate
pip install -r req.txt   # Install packages
python create_db.py      # Create database
python migrate_chat_messaging.py  # Add tables
python run.py            # Start server
```

**Frontend:**
```bash
npm install              # Install packages
npm start               # Start dev server
npm run build           # Build for production
```

---

## TESTING THE SYSTEM

1. **Two Browsers/Windows:** User in one, Doctor in other
2. **Create Accounts:** Verify emails
3. **User to Doctor:** Send request
4. **Doctor:** Accept request
5. **Chat:** Start messaging
6. **End:** Doctor ends chat

---

## LINKS

- Backend API: http://localhost:5000/api
- Frontend: http://localhost:3000
- Gmail Setup: https://myaccount.google.com/security
- Gmail App Passwords: https://myaccount.google.com/apppasswords

---

## DOCUMENTATION QUICK LINKS

| Need | Go To |
|------|-------|
| Run in 3 steps | HOW_TO_RUN.md |
| 5 minute setup | QUICK_START.md |
| Full guide | COMPLETE_SETUP_GUIDE.md |
| Checklist | GETTING_STARTED_CHECKLIST.md |
| Architecture | IMPLEMENTATION_SUMMARY.md |
| All docs | DOCUMENTATION_INDEX.md |

---

## STATUS

✅ **COMPLETE AND READY TO USE**

- All code implemented
- All endpoints working
- All features tested
- Documentation complete
- Ready for production

---

**Start: `HOW_TO_RUN.md`**
**Status: ✅ READY**
**Time to run: 5 minutes**

🚀 **Happy coding!**
