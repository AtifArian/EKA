# Mental Wellness Website - Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Python 3.8+** installed
- ✅ **pip** (comes with Python)
- ❌ **Node.js** - We'll install this

---

## Step 1: Install Node.js

### Windows:
1. Download from: https://nodejs.org/
2. Choose **LTS version** (e.g., 20.x.x)
3. Run installer and follow prompts
4. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```


---

## Step 2: Create Project Structure

```bash
# Create main project folder
mkdir mental-wellness-app
cd mental-wellness-app

# Create backend structure
mkdir -p backend/app/routes backend/app/utils

# Create frontend structure
mkdir -p frontend/public frontend/src/components frontend/src/pages frontend/src/services
```

---

## Step 3: Backend Setup

### 3.1 Create Backend Files

Navigate to `backend/` and create these files:

#### **backend/requirements.txt**
```txt
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
Flask-JWT-Extended==4.6.0
Flask-Bcrypt==1.0.1
python-dotenv==1.0.0
textblob==0.17.1
scikit-learn==1.3.2
numpy==1.26.2
pandas==2.1.4
Pillow==10.1.0
google-auth==2.25.2
google-auth-oauthlib==1.2.0
```

#### **backend/run.py**
```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5050, debug=True)
```

#### **backend/.env** (Optional - for production)
```
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3.2 Create Empty __init__.py Files

```bash
cd backend
touch app/__init__.py
touch app/routes/__init__.py
touch app/utils/__init__.py
```

**Note:** On Windows, use:
```bash
type nul > app/__init__.py
type nul > app/routes/__init__.py
type nul > app/utils/__init__.py
```

### 3.3 Copy All Backend Files

Copy these files from the provided code repository:
- `app/__init__.py`
- `app/config.py`
- `app/models.py`
- `app/routes/auth.py`
- `app/routes/users.py`
- `app/routes/doctors.py`
- `app/routes/clinics.py`
- `app/routes/articles.py`
- `app/routes/journals.py`
- `app/routes/mood.py`
- `app/utils/decorators.py`
- `app/utils/sentiment_analysis.py`
- `app/utils/suicide_prediction.py`

### 3.4 Install Backend Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate


# Install dependencies
pip install -r requirements.txt

# Download TextBlob corpora (required for sentiment analysis)
python -m textblob.download_corpora
```

---

## Step 4: Frontend Setup

### 4.1 Create Frontend Configuration Files

#### **frontend/package.json**
```json
{
  "name": "mental-wellness-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.2",
    "@react-oauth/google": "^0.12.1",
    "react-icons": "^4.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

#### **frontend/.env**
```
REACT_APP_API_URL=http://127.0.0.1:5050/api
```

#### **frontend/public/index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#7F7FD5" />
    <meta name="description" content="Mental Wellness Platform" />
    <title>MindCare - Mental Wellness</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 4.2 Copy All Frontend Files

Copy these files from the provided code repository:

**Core Files:**
- `src/index.js`
- `src/index.css`
- `src/App.jsx`
- `src/App.css`

**Services:**
- `src/services/api.js`
- `src/services/auth.js`

**Components:**
- `src/components/Navbar.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/MoodTracker.jsx`
- `src/components/ClinicTile.jsx`
- `src/components/ArticleTile.jsx`
- `src/components/JournalTile.jsx`

**Pages:**
- `src/pages/Home.jsx`
- `src/pages/Login.jsx`
- `src/pages/Signup.jsx`
- `src/pages/Clinics.jsx`
- `src/pages/ClinicDetail.jsx`
- `src/pages/Articles.jsx`
- `src/pages/ArticleDetail.jsx`
- `src/pages/Journals.jsx`
- `src/pages/MyProfile.jsx`
- `src/pages/UserProfile.jsx`

### 4.3 Install Frontend Dependencies

```bash
cd frontend

# Install all dependencies (takes 2-5 minutes)
npm install

# If you encounter errors, try:
npm install --legacy-peer-deps
```

---

## Step 5: Run the Website

### 5.1 Start Backend Server

**Terminal 1:**
```bash
cd mental-wellness-app/backend

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Run server
python run.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5050
 * Debug mode: on
```

**Keep this terminal open!**

### 5.2 Start Frontend Server

**Terminal 2** (open new terminal):
```bash
cd mental-wellness-app/frontend

# Start React app
npm start
```

**Expected Output:**
```
Compiled successfully!
The app is running at:
  Local:            http://localhost:3000
```

Your browser will automatically open to `http://localhost:3000`

---

## Step 6: Test the Website

### 6.1 Create User Account
1. Go to **Signup** page
2. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **Sign Up**

### 6.2 Test Mood Tracker
- After login, a popup should appear with 5 emojis
- Select your mood (e.g., 😄 Very Happy)
- It saves automatically

### 6.3 Create Journal Entry
1. Go to **MyProfile**
2. Click **+ New Journal**
3. Write title and content
4. Toggle **Make public** if you want
5. Click **Create Journal**

### 6.4 Test Doctor Features
1. **Logout** and **Signup** again as doctor:
   - Check "I am a doctor/therapist"
   - Upload any image file as verification
2. After login, go to **MyProfile**
3. You'll see doctor tabs: Patients, Chat Requests, Publish Article

---

## Step 7: Access from Other Devices (Optional)

### Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```


# or
ip addr show
# Look for inet address (e.g., 192.168.1.100)
```

### Update Configuration

**1. Backend (run.py):**
```python
app.run(host='0.0.0.0', port=5050, debug=True)
```

**2. Frontend (.env):**
```
REACT_APP_API_URL=http://192.168.1.100:5050/api
```
*(Replace with your actual IP)*

**3. Restart both servers**

**4. Access from phone/tablet:**
```
http://192.168.1.100:3000
```

---

## 🚨 Troubleshooting

### Backend Issues

**Problem: `No module named 'flask'`**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

**Problem: Port 5050 already in use**
```bash
# Change port in run.py and frontend/.env
# Use 5051 or any available port
```

**Problem: Database errors**
```bash
# Delete database and restart
rm mental_wellness.db  # or delete manually on Windows
python run.py
```

**Problem: TextBlob download fails**
```bash
# Manually download corpora
python -m textblob.download_corpora
```

### Frontend Issues

**Problem: `npm install` fails**
```bash
# Clear cache
npm cache clean --force
npm install --legacy-peer-deps
```

**Problem: "Module not found" errors**
- Ensure all files are in correct folders
- Check file names match exactly (case-sensitive)
- Restart development server: Ctrl+C, then `npm start`

**Problem: API connection errors**
- Verify backend is running on port 5050
- Check `.env` file has correct URL
- Try `http://localhost:5050/api` instead of `127.0.0.1`

**Problem: Blank page after login**
- Open browser console (F12)
- Check for JavaScript errors
- Verify all page components exist

**Problem: CORS errors**
- Make sure Flask-CORS is installed
- Backend should show no errors
- Try restarting both servers

---

## 📁 Final Project Structure

```
mental-wellness-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── doctors.py
│   │   │   ├── clinics.py
│   │   │   ├── articles.py
│   │   │   ├── journals.py
│   │   │   └── mood.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── decorators.py
│   │       ├── sentiment_analysis.py
│   │       └── suicide_prediction.py
│   ├── venv/ (created automatically)
│   ├── uploads/ (created automatically)
│   ├── mental_wellness.db (created automatically)
│   ├── requirements.txt
│   ├── run.py
│   └── .env (optional)
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── MoodTracker.jsx
    │   │   ├── ClinicTile.jsx
    │   │   ├── ArticleTile.jsx
    │   │   └── JournalTile.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Clinics.jsx
    │   │   ├── ClinicDetail.jsx
    │   │   ├── Articles.jsx
    │   │   ├── ArticleDetail.jsx
    │   │   ├── Journals.jsx
    │   │   ├── MyProfile.jsx
    │   │   └── UserProfile.jsx
    │   ├── services/
    │   │   ├── api.js
    │   │   └── auth.js
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── node_modules/ (created automatically)
    ├── package.json
    ├── package-lock.json (created automatically)
    └── .env
```

---

## ✨ Features Included

✅ **Authentication:**
- User & Doctor Registration/Login
- JWT Token-based Authentication
- Google OAuth Integration

✅ **User Features:**
- Daily Mood Tracker (5 emoji levels, editable)
- Personal Journal System (Public/Private toggle)
- Friend System (Search & Add)
- View Articles & Journals
- Like & Comment on Articles
- Heart & Comment on Journals
- View Clinic Profiles
- Book Sessions with Doctors
- Send Chat Requests to Doctors

✅ **Doctor Features:**
- Publish Articles with Mood Categories
- View Patient List with Suicide Risk Scores
- Accept/Reject Chat Requests
- Access Patient Data (mood, articles, journals)
- Receive Reviews & Ratings

✅ **AI Features:**
- Sentiment Analysis using TextBlob
- Suicide Risk Prediction Algorithm:
  - 40% weight: Mood tracker data (last 30 days)
  - 30% weight: Article preferences (mood categories)
  - 30% weight: Journal sentiment scores
- Risk score: 0-100 (color-coded: green, yellow, red)

✅ **Design:**
- Gradient Theme: #7F7FD5, #86A8E7, #91EAE4
- Responsive Design (desktop, tablet, mobile)
- Smooth Animations & Hover Effects
- Clean, Modern UI

---

## 🎯 Quick Start Summary

```bash
# 1. Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m textblob.download_corpora
python run.py

# 2. Frontend (new terminal)
cd frontend
npm install
npm start

# 3. Open browser
http://localhost:3000
```

---

## 🎉 You're Done!

Your Mental Wellness Website is now running at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://127.0.0.1:5050/api

---

## 📞 Support & Common Commands

**Stop Servers:**
```bash
Ctrl + C (in terminal)
```

**Restart Backend:**
```bash
# Activate venv first
python run.py
```

**Restart Frontend:**
```bash
npm start
```

**Reset Database:**
```bash
# Delete mental_wellness.db file
# Restart backend - new database will be created
```

**View Backend Logs:**
- Check Terminal 1 for Flask output
- Errors will appear in red

**View Frontend Logs:**
- Check Terminal 2 for React output
- Open Browser Console (F12) for JavaScript errors

---

## 🔐 Important Notes

1. **Never commit `.env` files to Git** - Contains secret keys
2. **SQLite database** - For development only, use PostgreSQL/MySQL for production
3. **Debug mode** - Only use `debug=True` in development
4. **Google OAuth** - Requires setup in Google Cloud Console
5. **HTTPS** - Required for production deployment
6. **Backup database** - Regularly backup `mental_wellness.db`

---

## 📚 Additional Resources

- **Flask Documentation:** https://flask.palletsprojects.com/
- **React Documentation:** https://react.dev/
- **SQLAlchemy:** https://www.sqlalchemy.org/
- **JWT Authentication:** https://jwt.io/
- **TextBlob:** https://textblob.readthedocs.io/

---

## 🏆 Project Credits

**Mental Wellness Website**
- Full-stack web application for mental health support
- Built with Flask (Python) + React (JavaScript)
- Features: Mood tracking, Journaling, Doctor-Patient system, AI risk prediction
- Theme: Gradient (#7F7FD5, #86A8E7, #91EAE4)

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**License:** MIT (or your preferred license)

---

## ✅ Checklist for New Setup

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] Created project structure
- [ ] Copied all backend files
- [ ] Copied all frontend files
- [ ] Created virtual environment
- [ ] Installed backend dependencies
- [ ] Downloaded TextBlob corpora
- [ ] Installed frontend dependencies
- [ ] Created .env files
- [ ] Started backend server (port 5050)
- [ ] Started frontend server (port 3000)
- [ ] Tested signup/login
- [ ] Tested mood tracker
- [ ] Created test journal
- [ ] Tested doctor account

**Good luck building your Mental Wellness Platform! 💙🧠**
