# Complete Chat System Guide

## 🎯 How the Chat System Works

### For Users (Non-Doctors):

1. **Browse Doctors** → Go to `/doctors` (or click "💬 Chat Doctors" in navbar)
2. **View Doctor Profiles** → See specialization, rating, experience, etc.
3. **Send Chat Request** → Click "Request Chat" button on a doctor's profile
4. **Wait for Response** → Doctor accepts or declines your request
5. **Start Chatting** → Once accepted, you can chat in real-time
6. **View History** → Go to `/chats` (or click "📧 My Chats" in navbar) to see all conversations

### For Doctors:

1. **Receive Requests** → Go to `/doctor-dashboard` (or click "👨‍⚕️ Dashboard" in navbar)
2. **View Pending Requests** → See list of chat requests from users
3. **Accept/Decline** → Choose to accept or decline each request
4. **Chat with Patients** → Once accepted, chat with the user in real-time
5. **End Conversation** → Doctor can end the chat at any time

---

## 📋 Feature Breakdown

### User Pages:

#### 1. **Chat Doctors Page** (`/doctors`)
- Browse all doctors
- Search by name or specialty
- Filter by specialization
- View doctor ratings and reviews
- Send chat request to any doctor
- Modal form to add optional message with request

**What it shows:**
- Doctor's name and specialization
- Rating and review count
- Education and expertise
- Session charge information
- Verified badge

#### 2. **My Chats Page** (`/chats`)
- Two tabs: "Active Chats" and "Chat Requests"
- View list of active conversations
- See pending/accepted/rejected requests
- Click to open and chat with doctor
- Real-time messaging interface

#### 3. **Chat Interface** (Component)
- Real-time message display
- Send and receive messages instantly
- Auto-refresh every 2 seconds
- Message history
- Status indicator (active/ended)

### Doctor Pages:

#### 1. **Doctor Dashboard** (`/doctor-dashboard`)
- Two tabs: "Pending Requests" and "Active Chats"
- Accept or decline chat requests
- View patient information
- Start chatting once accepted
- End conversation at any time

#### 2. **Chat Interface** (Component - Same as users)
- Send/receive messages
- Mark conversation as ended
- Leave conversation

---

## 🔄 Chat Request Flow

```
User sends request
    ↓
Request stored with status = 'pending'
    ↓
Doctor sees pending request in dashboard
    ↓
Doctor accepts/declines
    ↓
If accepted:
  • Chat created between user and doctor
  • Status = 'accepted'
  • Both can now chat
  ↓
If declined:
  • Status = 'declined'
  • No chat created
```

---

## 💬 Chat Status Lifecycle

| Status | Meaning | Can Chat? |
|--------|---------|-----------|
| `pending` | Waiting for doctor response | No |
| `accepted` | Doctor accepted, chat active | Yes |
| `declined` | Doctor rejected the request | No |
| `active` | Chat is ongoing | Yes |
| `ended` | Doctor ended the chat | No |

---

## 📱 User Stories

### User Story 1: Send Chat Request
```
1. User logs in
2. User clicks "💬 Chat Doctors" in navbar
3. User browses list of doctors
4. User clicks "Request Chat" on desired doctor
5. Modal pops up asking for optional message
6. User types message and clicks "Request Chat"
7. System shows "Chat request sent successfully!"
8. User sees request in "My Chats" → "Chat Requests" tab
9. Request shows status as "PENDING"
```

### User Story 2: Chat with Doctor (After Request Accepted)
```
1. User goes to "My Chats"
2. Sees request status changed to "ACCEPTED"
3. Clicks on the chat from "Active Chats" tab
4. Chat interface opens
5. User types message and sends
6. Message appears in chat
7. Doctor responds in real-time
8. Conversation continues until doctor ends it
```

### User Story 3: Check Chat History
```
1. User goes to "My Chats"
2. Sees two tabs: Active Chats and Chat Requests
3. Active Chats shows all ongoing conversations
4. Chat Requests shows all sent requests with status
5. Can click any active chat to continue chatting
```

### Doctor Story 1: Review Chat Requests
```
1. Doctor logs in
2. Doctor clicks "👨‍⚕️ Dashboard" in navbar
3. Sees "Pending Requests" tab with all new requests
4. Each request shows:
   - Patient name
   - Optional message from patient
   - Request date
   - Accept/Decline buttons
5. Doctor clicks "Accept" or "Decline"
6. Request moves to history
```

### Doctor Story 2: Chat with Patient
```
1. Doctor accepts a chat request
2. Chat appears in "Active Chats" tab
3. Doctor clicks on chat
4. Chat interface opens
5. Doctor types and sends messages
6. Can see all previous messages
7. Doctor can click "End Chat" to close conversation
8. Chat moves to history
```

---

## 🛠️ How to Run the Project

### Prerequisites:
- Node.js and npm installed
- Python 3.7+ installed
- PostgreSQL database set up

### Step 1: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env

# Add to .env:
DATABASE_URL=postgresql://user:password@localhost/eka_db
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=development
GOOGLE_CLIENT_ID=your-google-client-id
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# Run database migration for email verification
python migrate_email_verification.py

# Run migrations for chat system (if needed)
python run.py
```

### Step 2: Backend Server

```bash
# In backend folder
python run.py

# Server runs on http://localhost:5000
# You should see: "Running on http://127.0.0.1:5000"
```

### Step 3: Frontend Setup

```bash
# In new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env

# Add to .env:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### Step 4: Frontend Server

```bash
# In frontend folder
npm start

# Frontend runs on http://localhost:3000
# Browser opens automatically
```

---

## 🧪 Testing the Chat System

### Test as User:

```
1. Go to http://localhost:3000
2. Sign up (use email verification if enabled)
3. Login
4. Click "💬 Chat Doctors" in navbar
5. Browse doctors
6. Click "Request Chat" on any doctor
7. Send a message (optional)
8. Go to "My Chats" to see request
9. Wait for doctor to accept (or login as doctor to accept)
```

### Test as Doctor:

```
1. Create a doctor account during signup (check "I am a doctor/therapist")
2. Upload verification document
3. Complete doctor profile
4. Login
5. Click "👨‍⚕️ Dashboard" in navbar
6. See pending chat requests
7. Click "Accept" on a request
8. Click on chat to start messaging
9. Send messages
10. Click "End Chat" to close conversation
```

### Test Chat Request Lifecycle:

```
Step 1: User sends request
- User logs in
- Goes to /doctors
- Sends chat request

Step 2: Doctor receives
- Doctor logs in
- Goes to /doctor-dashboard
- Sees pending request in "Pending Requests" tab

Step 3: Doctor accepts
- Doctor clicks "Accept"
- Request moves to "Active Chats"

Step 4: User sees accepted
- User goes to /chats
- Request shows "ACCEPTED"
- Chat appears in "Active Chats" tab

Step 5: Both can chat
- Click on chat
- Send/receive messages
- Messages appear instantly (refreshes every 2 seconds)

Step 6: Doctor ends chat
- Doctor clicks "End Chat"
- Chat status changes to "ended"
- Both see conversation ended
```

---

## 📂 File Structure

```
Frontend:
├── pages/
│   ├── Doctors.jsx (NEW) - Browse doctors
│   ├── MyChats.jsx - View active chats and requests
│   ├── DoctorDashboard.jsx - Doctor's request management
│   ├── EmailVerification.jsx
│   └── ResendVerification.jsx
├── components/
│   ├── SendChatRequest.jsx - Send request form
│   ├── ChatInterface.jsx - Chat UI
│   ├── Navbar.jsx (UPDATED) - Added links
│   └── ...
├── services/
│   ├── messages.js - Chat API calls
│   ├── auth.js (UPDATED) - Email verification functions
│   └── ...
├── styles/
│   ├── Doctors.css (NEW)
│   ├── MyChats.css
│   ├── ChatInterface.css
│   ├── DoctorDashboard.css
│   └── ...
└── App.jsx (UPDATED) - Added routes

Backend:
├── app/
│   ├── models.py (UPDATED) - Chat, Message, ChatRequest models
│   ├── routes/
│   │   ├── messages.py (NEW) - Chat endpoints
│   │   ├── auth.py (UPDATED) - Email verification endpoints
│   │   ├── doctors.py (UPDATED) - Doctor routes
│   │   └── ...
│   ├── utils/
│   │   ├── email_verification.py (NEW) - Email sending
│   │   └── decorators.py
│   └── __init__.py
├── run.py
├── migrate_email_verification.py (NEW)
└── requirements.txt (UPDATED)
```

---

## 🔑 Key Components

### 1. **SendChatRequest Component**
- Lets users send chat request to doctor
- Shows optional message textarea
- Handles request submission
- Shows existing request status

**Props:**
- `doctor` - Doctor object with ID and details
- `user` - Current user object
- `onRequestSent` - Callback when request sent

**Usage:**
```jsx
<SendChatRequest 
  doctor={doctor} 
  user={user} 
  onRequestSent={handleRequestSent} 
/>
```

### 2. **ChatInterface Component**
- Displays messages and chat history
- Lets users/doctors send messages
- Auto-refreshes to get new messages
- Shows chat status (active/ended)

**Props:**
- `chatId` - ID of the chat
- `user` - Current user object
- `onChatEnded` - Callback when chat ends

**Usage:**
```jsx
<ChatInterface 
  chatId={chat.id} 
  user={user} 
  onChatEnded={handleChatEnded}
/>
```

### 3. **Doctors Page**
- Grid display of all doctors
- Search and filter functionality
- Doctor cards with profile info
- Modal for sending requests

**Route:** `/doctors`

### 4. **MyChats Page**
- Active conversations list
- Pending requests list
- Click to open chat
- Auto-refreshes

**Route:** `/chats` (Protected - Users only)

### 5. **DoctorDashboard Page**
- Pending requests tab
- Active chats tab
- Accept/decline buttons
- Chat interface

**Route:** `/doctor-dashboard` (Protected - Doctors only)

---

## 🔗 API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/chats/send-request` | POST | Send chat request | Yes |
| `/chats/my-requests/sent` | GET | Get sent requests | Yes |
| `/chats/requests/pending` | GET | Get pending requests (doctor) | Yes |
| `/chats/requests/<id>/respond` | PUT | Accept/decline request | Yes |
| `/chats` | GET | Get my chats | Yes |
| `/chats/<id>` | GET | Get chat with messages | Yes |
| `/chats/<id>/messages` | POST | Send message | Yes |
| `/chats/<id>/end` | POST | End chat (doctor) | Yes |
| `/clinics/` | GET | List all doctors | No |
| `/clinics/<id>` | GET | Get doctor details | No |
| `/auth/signup` | POST | Create account | No |
| `/auth/login` | POST | Login | No |
| `/auth/verify-email` | POST | Verify email | No |
| `/auth/resend-verification-email` | POST | Resend verification | No |

---

## 🎨 Styling

All components use CSS with:
- **Color scheme:** Purple (`#7F7FD5`) and pink (`#986DE2`)
- **Responsive design:** Mobile-friendly layouts
- **Smooth transitions:** Hover effects and animations
- **Consistent styling:** Buttons, cards, modals, tabs

---

## 🚀 Deployment

### To Deploy:

1. **Backend (Heroku/AWS/Railway):**
   ```
   - Push to git
   - Set environment variables
   - Database migrations run automatically
   ```

2. **Frontend (Vercel/Netlify):**
   ```
   - Connect GitHub repo
   - Set REACT_APP_API_URL to production backend
   - Auto-deploys on push
   ```

---

## ❓ Troubleshooting

### Issue: Can't send chat request
- Check user is logged in
- Check user is not a doctor
- Check backend is running

### Issue: Messages not appearing
- Check chat is accepted
- Try refreshing page
- Check network in DevTools

### Issue: Doctor dashboard empty
- Check you're logged as doctor
- Check doctor profile is complete
- Check there are pending requests

### Issue: Email verification not sending
- Check Gmail credentials in .env
- Check 2-Step Verification is enabled
- Use App Password, not regular password

---

## 📞 Support

For issues, check:
1. Backend terminal for errors
2. Browser console (F12) for errors
3. Network tab to see API calls
4. Check .env has all required variables
