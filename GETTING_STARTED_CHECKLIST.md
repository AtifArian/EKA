# ✅ EKA Project - Getting Started Checklist

Use this checklist to ensure everything is set up correctly before running the project.

---

## 📋 Pre-Setup Checklist

### System Requirements
- [ ] Python 3.8+ installed (`python --version` shows 3.8+)
- [ ] Node.js 14+ installed (`node --version` shows 14+)
- [ ] npm installed (`npm --version` shows version)
- [ ] Git installed (optional, but recommended)
- [ ] Text editor/IDE (VSCode recommended)
- [ ] Gmail account (for email verification)

### Files Check
- [ ] Project folder exists at `e:\CSE423_Assignment\Lab Project\EKA`
- [ ] Backend folder exists: `EKA/backend`
- [ ] Frontend folder exists: `EKA/frontend`
- [ ] `requirements.txt` exists in backend
- [ ] `package.json` exists in frontend

### Documentation Check
- [ ] `QUICK_START.md` exists (or generated)
- [ ] `COMPLETE_SETUP_GUIDE.md` exists (or generated)
- [ ] `IMPLEMENTATION_SUMMARY.md` exists (or generated)
- [ ] `README.md` exists in project root

---

## 🔐 Gmail Setup (One-Time Setup)

### Before Starting Backend
- [ ] Gmail account ready
- [ ] Gmail 2-Step Verification enabled
  - Go to https://myaccount.google.com/security
  - Scroll to "2-Step Verification"
  - Complete setup if not already done
- [ ] App Password generated (16 characters)
  - Go to https://myaccount.google.com/security
  - Click "App passwords"
  - Select "Mail" and "Windows Computer"
  - Copy the 16-character password
- [ ] Password saved securely (you'll need it for `.env`)

---

## 🔧 Backend Setup Checklist

### Create Virtual Environment
- [ ] Navigate to `EKA/backend` folder
- [ ] Run: `python -m venv venv`
- [ ] Activate virtual environment:
  - [ ] Windows: `venv\Scripts\activate`
  - [ ] Mac/Linux: `source venv/bin/activate`
- [ ] Verify activation (prompt shows `(venv)`)

### Install Dependencies
- [ ] Run: `pip install -r requirements.txt`
- [ ] Wait for all packages to install (2-5 minutes)
- [ ] Verify installation: `pip list` shows all packages

### Configure Environment Variables
- [ ] Create file: `backend/.env`
- [ ] Add these variables (update with your values):
  ```env
  FLASK_ENV=development
  FLASK_DEBUG=True
  SECRET_KEY=your-secret-key-change-this
  DATABASE_URL=sqlite:///eka.db
  GMAIL_EMAIL=your-email@gmail.com
  GMAIL_PASSWORD=your-16-char-app-password
  FRONTEND_URL=http://localhost:3000
  JWT_SECRET_KEY=your-jwt-secret-change-this
  FLASK_RUN_PORT=5000
  ```
- [ ] Save the `.env` file (do NOT commit to Git)

### Initialize Database
- [ ] Make sure you're in `backend` folder with venv activated
- [ ] Run: `python create_db.py`
- [ ] Wait for database creation (creates `eka.db` file)
- [ ] Verify: Check if `eka.db` file was created

### Run Database Migrations
- [ ] Run: `python migrate_email_verification.py`
- [ ] Wait for migration to complete
- [ ] Run: `python migrate_chat_messaging.py` 
- [ ] Wait for chat tables to be created
- [ ] You should see ✅ messages indicating success

### Test Backend Start
- [ ] Run: `python run.py`
- [ ] You should see output like:
  ```
  WARNING: This is a development server. Do not use it in production.
  Running on http://127.0.0.1:5000/
  ```
- [ ] Keep this terminal open (backend is running)
- [ ] Test endpoint: Open browser and go to `http://localhost:5000/api/auth/health`

---

## 🎨 Frontend Setup Checklist

### Open New Terminal
- [ ] Open new terminal window/tab (keep backend running in first one)
- [ ] Navigate to `EKA/frontend` folder
- [ ] You should be in the frontend directory: `frontend>`

### Install Dependencies
- [ ] Run: `npm install`
- [ ] Wait for all packages to install (2-5 minutes)
- [ ] Verify: Check if `node_modules` folder was created

### Configure Environment Variables
- [ ] Create file: `frontend/.env`
- [ ] Add these variables:
  ```env
  REACT_APP_API_URL=http://localhost:5000/api
  REACT_APP_FRONTEND_URL=http://localhost:3000
  ```
- [ ] Save the `.env` file

### Test Frontend Start
- [ ] Run: `npm start`
- [ ] Browser should auto-open to `http://localhost:3000`
- [ ] You should see the EKA home page
- [ ] If not, check terminal for errors

---

## ✅ Both Servers Running

### Verification
- [ ] Backend terminal shows "Running on http://127.0.0.1:5000/"
- [ ] Frontend terminal shows "webpack compiled successfully"
- [ ] Browser is open at `http://localhost:3000`
- [ ] You can see the EKA website in browser

### If Not Running
- [ ] Backend not running? Check `.env` file, check terminal for errors
- [ ] Frontend not running? Check `.env` file, check terminal for errors
- [ ] Port conflicts? See TROUBLESHOOTING section

---

## 🧪 Testing Checklist

### Test 1: Email Verification
- [ ] Go to `http://localhost:3000/signup`
- [ ] Create new account
- [ ] Enter valid email address
- [ ] Click "Sign up"
- [ ] Check email inbox for verification link
- [ ] Click verification link in email
- [ ] You should be redirected to login page

### Test 2: Create Doctor Account
- [ ] Go to `http://localhost:3000/signup`
- [ ] Fill in form
- [ ] Check "I am a doctor/therapist"
- [ ] Upload a verification document (any image file)
- [ ] Click "Sign up"
- [ ] Verify email from inbox
- [ ] Doctor account is now ready

### Test 3: User Sends Chat Request
- [ ] Open first browser window (or private/incognito)
- [ ] Log in as regular user
- [ ] Go to `/clinics` page
- [ ] Click on a doctor
- [ ] Click "Request Chat" button
- [ ] Enter optional message
- [ ] Click "Send Request"
- [ ] Go to `/chats` page
- [ ] You should see pending request

### Test 4: Doctor Accepts Request
- [ ] Open second browser window (or different browser)
- [ ] Log in as doctor
- [ ] Go to `/doctor-dashboard`
- [ ] You should see "Pending Requests" tab with user's request
- [ ] Click "Accept" button
- [ ] Chat should now appear in "Active Chats" tab

### Test 5: Start Messaging
- [ ] Both windows should now show active chat
- [ ] User window: Go to `/chats` and click the chat
- [ ] Doctor window: Go to `/doctor-dashboard` and click chat from "Active Chats"
- [ ] Both should see ChatInterface with message box
- [ ] Send a test message from each side
- [ ] Messages should appear in real-time
- [ ] Messages should not disappear when refreshing

### Test 6: End Chat (Doctor)
- [ ] In doctor window, click "End Chat" button
- [ ] In user window, refresh page
- [ ] Chat should now show "Ended" status
- [ ] User should not be able to send new messages
- [ ] But user can still see message history

---

## 🐛 Troubleshooting Checklist

### Backend Won't Start

If `python run.py` fails:

- [ ] Check that venv is activated (prompt shows `(venv)`)
- [ ] Check that all dependencies installed: `pip list | grep flask`
- [ ] Check `.env` file exists and has required variables
- [ ] Check database exists: Look for `eka.db` file
- [ ] Check port 5000 is not in use:
  - [ ] Windows: `netstat -ano | findstr :5000`
  - [ ] Mac/Linux: `lsof -i :5000`
- [ ] Check error message in terminal carefully
- [ ] Try: `pip install -r requirements.txt` again
- [ ] If all else fails: Delete `venv` and create new one

### Frontend Won't Start

If `npm start` fails:

- [ ] Check that you're in `frontend` folder
- [ ] Check `package.json` exists
- [ ] Check `node_modules` folder exists (if not, run `npm install`)
- [ ] Check `.env` file exists
- [ ] Check port 3000 is not in use:
  - [ ] Windows: `netstat -ano | findstr :3000`
  - [ ] Mac/Linux: `lsof -i :3000`
- [ ] Check Node.js version is 14+: `node --version`
- [ ] Try: `npm install` again
- [ ] Try: Clear npm cache: `npm cache clean --force`

### Email Verification Not Working

- [ ] Check Gmail credentials in `.env` are correct
- [ ] Check using 16-char App Password (NOT regular Gmail password)
- [ ] Check Gmail 2-Step Verification is enabled
- [ ] Check spam folder for verification email
- [ ] Check backend terminal for email errors
- [ ] Try sending again (sometimes takes a few seconds)

### Chat Not Appearing

- [ ] Refresh both browser windows
- [ ] Check both users are logged in
- [ ] Check request was actually sent (look in `/chats` page)
- [ ] Check doctor accepted request (look in `/doctor-dashboard`)
- [ ] Check browser console for errors: `F12` → Console
- [ ] Check backend terminal for errors

### Port Already in Use

**Port 5000:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Port 3000:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

---

## 📚 Documentation Reference

### Quick Questions
- How to run the project? → See **QUICK_START.md**
- Full setup details? → See **COMPLETE_SETUP_GUIDE.md**
- What was built? → See **IMPLEMENTATION_SUMMARY.md**
- How do I use X feature? → Check comments in source code

### File Locations
- Backend routes: `backend/app/routes/messages.py`
- Frontend chat component: `frontend/src/components/ChatInterface.jsx`
- Database models: `backend/app/models.py`
- API service: `frontend/src/services/messages.js`

---

## 🎯 Success Criteria

✅ **You're successful when:**
1. Backend runs without errors
2. Frontend loads in browser
3. Can create account and verify email
4. Can see login page after email verification
5. Can log in with email and password
6. Can see home page after login
7. Can navigate to different pages
8. Can complete full chat flow:
   - User sends request
   - Doctor accepts
   - Both can message
   - Doctor can end chat

---

## 🎉 Ready to Go!

Once all checkboxes are checked:
1. Project is set up correctly
2. Both servers are running
3. Features are working
4. You can start developing!

### Next Steps
- [ ] Customize the styling (CSS files)
- [ ] Add more doctors/clinics
- [ ] Test with real data
- [ ] Deploy to production
- [ ] Gather user feedback
- [ ] Add more features

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| venv not activating | Delete venv folder, create new one |
| Dependencies not installing | Check internet connection, try again |
| Port in use | Kill process using that port |
| Email not received | Check spam folder, resend |
| Chat not working | Refresh browser, both users logged in |
| Database error | Delete `.db` file, run `create_db.py` again |

---

## 💡 Pro Tips

✨ **Tips for smooth setup:**
1. Keep both terminals visible (side by side)
2. Use browser incognito/private mode for second user
3. Check terminal output carefully for error messages
4. Don't skip email verification setup
5. Test with 2 different browsers/windows for full experience
6. Refresh frequently while testing

✨ **Tips while running:**
1. Keep terminals open while working
2. Check browser console (F12) for frontend errors
3. Check terminal output for backend errors
4. Restart servers if something acts weird
5. Clear browser cache if UI looks broken

---

**Last Updated:** 2024
**Status:** ✅ Ready to Use
