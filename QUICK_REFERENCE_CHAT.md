# 🎯 Quick Reference - Chat System

## User Quick Guide

### To Chat with a Doctor:

1. **Login/Signup** → Verify email
2. Click **"💬 Chat Doctors"** in navbar
3. **Browse** doctors (search/filter)
4. Click **"Request Chat"** on doctor
5. **Add message** (optional) and send
6. Go to **"📧 My Chats"** to track request
7. Once doctor **accepts** → **Click chat** to message
8. Chat continues until doctor **ends** it

### URLs for Users:
- `/doctors` - Browse and send requests
- `/chats` - View requests and active chats
- `/clinics` - Alternative doctor list
- `/profile` - User profile

---

## Doctor Quick Guide

### To Manage Chat Requests:

1. **Login** with doctor account
2. Click **"👨‍⚕️ Dashboard"** in navbar
3. See **"Pending Requests"** tab
4. **Accept** or **Decline** each request
5. **Accepted** requests move to **"Active Chats"**
6. Click on chat to **message** patient
7. Click **"End Chat"** to close conversation

### URLs for Doctors:
- `/doctor-dashboard` - Manage requests
- `/profile` - Complete doctor profile
- `/clinics` - View your clinic profile

---

## Chat Status Legend

| Status | Meaning | Can Chat? |
|--------|---------|-----------|
| 🟡 PENDING | Waiting for doctor | No |
| 🟢 ACCEPTED | Doctor accepted | Yes |
| 🔴 DECLINED | Doctor declined | No |
| ⚫ ENDED | Doctor ended chat | No |

---

## Features at a Glance

### Users Can:
- ✅ Browse all doctors with ratings
- ✅ Search doctors by name
- ✅ Filter by specialization
- ✅ View doctor credentials
- ✅ Send chat request with message
- ✅ Track request status
- ✅ Chat once accepted
- ✅ View all past chats

### Doctors Can:
- ✅ Receive chat requests
- ✅ See patient message
- ✅ Accept or decline
- ✅ Chat with patients
- ✅ End conversation
- ✅ View active patients

---

## Navigation Shortcuts

### From Home Page:
- **Users** → Click navbar "💬 Chat Doctors"
- **Doctors** → Click navbar "👨‍⚕️ Dashboard"

### View Your Chats:
- **Users** → Click navbar "📧 My Chats" → See all requests/chats
- **Doctors** → Click navbar "👨‍⚕️ Dashboard" → See all requests/chats

### Direct URLs:
- `/doctors` - Browse doctors
- `/chats` - My chats (users)
- `/doctor-dashboard` - Doctor panel

---

## Send Chat Request Flow

```
1. Go to /doctors
   ↓
2. Find doctor → Click "Request Chat"
   ↓
3. Modal appears → Add message (optional)
   ↓
4. Click "Request Chat" → "Sent successfully!"
   ↓
5. Go to /chats → See request with "PENDING" status
   ↓
6. Wait for doctor to accept
   ↓
7. Status changes to "ACCEPTED"
   ↓
8. Click on chat → Start messaging
```

---

## Accept Chat Request Flow (Doctor)

```
1. Go to /doctor-dashboard
   ↓
2. See "Pending Requests" tab
   ↓
3. Click "Accept" on request
   ↓
4. Request moves to "Active Chats"
   ↓
5. Click on chat → Chat interface opens
   ↓
6. Send/receive messages
   ↓
7. Click "End Chat" when done
```

---

## Doctor Profile Setup

```
After signup as doctor:
1. Go to /profile
2. Complete doctor profile:
   - Specialization
   - Education
   - Expertise
   - Bio
   - Location
   - Session charge
3. Save profile
4. Profile appears on /doctors page
5. Users can now send requests
```

---

## Common Tasks

### Browse Doctors:
```
Navbar → 💬 Chat Doctors → See grid of doctors
Or direct: http://localhost:3000/doctors
```

### Send Chat Request:
```
/doctors page → Find doctor → Click "Request Chat" 
→ Add optional message → Click "Request Chat"
```

### View My Requests:
```
Navbar → 📧 My Chats → "Chat Requests" tab 
→ See all sent requests with status
```

### Accept Request (Doctor):
```
Navbar → 👨‍⚕️ Dashboard → "Pending Requests" tab
→ See request → Click "Accept"
```

### Start Chatting:
```
Go to /chats (users) or /doctor-dashboard (doctors)
→ Click accepted chat → Type message → Send
```

### End Chat (Doctor):
```
While in chat interface → Click "End Chat" button
→ Chat closes for both users
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open chat page | Go to `/chats` |
| Open doctor page | Go to `/doctors` |
| Open doctor dashboard | Go to `/doctor-dashboard` |
| Go home | Go to `/` |
| Refresh page | `F5` or `Ctrl+R` |
| Open DevTools | `F12` |

---

## Visual Navigation Map

```
Home (/)
├── Navbar Menu
│   ├── 💬 Chat Doctors → /doctors (Browse & Request)
│   ├── 📧 My Chats → /chats (View Chats - Users)
│   ├── 👨‍⚕️ Dashboard → /doctor-dashboard (Manage - Doctors)
│   ├── Clinics → /clinics
│   ├── Articles → /articles
│   ├── Journals → /journals
│   ├── MyProfile → /profile
│   └── Logout
│
└── Chat System Pages
    ├── /doctors (Browse Doctors)
    │   └── Send Request → Modal
    ├── /chats (My Chats - Users)
    │   ├── Tab: Active Chats
    │   └── Tab: Chat Requests
    └── /doctor-dashboard (Doctor Dashboard)
        ├── Tab: Pending Requests
        └── Tab: Active Chats
```

---

## Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Email not verified" | Verify email first (check inbox) |
| "Doctor not found" | Go to /doctors page first |
| "Chat not started" | Wait for doctor to accept request |
| "Messages not loading" | Refresh page, check connection |
| "Cannot send request" | Login first, must be user (not doctor) |
| "Cannot end chat" | Only doctor can end chat |

---

## Request Statuses

| What You See | What It Means | Next Step |
|---|---|---|
| 🟡 PENDING | Doctor hasn't responded | Wait or resend |
| 🟢 ACCEPTED | Doctor accepted! | Click to chat |
| 🔴 DECLINED | Doctor rejected | Find another doctor |
| ⚫ ENDED | Chat is finished | View in history |

---

## Real-time Chat Features

✅ **Auto-refresh** - Messages update every 2 seconds
✅ **Message history** - See all previous messages
✅ **Timestamps** - See when each message was sent
✅ **Sender identification** - Know who sent what
✅ **Status indicator** - See if chat is active/ended
✅ **Scroll to bottom** - Jump to latest messages

---

## Tips & Tricks

💡 **Search doctors:**
- Type in search box on /doctors page
- Filter by specialization dropdown

💡 **Add message to request:**
- Optional but helps doctor understand your concern
- Can be left blank

💡 **Track requests:**
- Go to /chats → "Chat Requests" tab
- See all sent requests with dates

💡 **Check chat history:**
- Go to /chats → "Active Chats" tab
- Click to view past messages

💡 **Refresh if stuck:**
- Page not updating? Hit `F5` to refresh
- Messages not showing? Refresh chat

---

## Starting Fresh

**Reset your account:**
1. Logout (click Logout in navbar)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again

**New chat:**
1. Go to /doctors
2. Send request to different doctor

**Clear requests:**
- Requests stay in history
- Cannot delete, but can send new ones

---

## Support

Need help? Check:
1. **Detailed guide** - Read COMPLETE_CHAT_GUIDE.md
2. **Setup issues** - Read HOW_TO_RUN_CHAT_SYSTEM.md
3. **Terminal errors** - Check backend/frontend logs
4. **Browser errors** - Open DevTools (F12)
5. **Network issues** - Check Network tab in DevTools

---

**Happy chatting!** 💬
