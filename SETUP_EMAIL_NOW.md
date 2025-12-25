# ⚠️ IMPORTANT: Complete Email Setup Required

## Current Status
✅ Email configuration structure added to `.env`  
✅ Code fixed to display email on verification page  
✅ Email sending functionality implemented  
❌ **You need to add your Gmail credentials**

---

## Quick Setup (5 minutes)

### 1. Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. If prompted, enable **2-Step Verification** first
3. Create app password:
   - App: **Mail**
   - Device: **Other** → Enter "EKA"
4. **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)

### 2. Update Backend Configuration

Open: `backend/.env`

Replace these lines:
```env
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password-here
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

With YOUR credentials:
```env
MAIL_USERNAME=YOUR_ACTUAL_EMAIL@gmail.com
MAIL_PASSWORD=abcdefghijklmnop  # Remove spaces from App Password
MAIL_DEFAULT_SENDER=YOUR_ACTUAL_EMAIL@gmail.com
```

**Example:**
```env
MAIL_USERNAME=khaled.mahmud@g.bracu.ac.bd
MAIL_PASSWORD=abcdefghijklmnop
MAIL_DEFAULT_SENDER=khaled.mahmud@g.bracu.ac.bd
```

### 3. Test Email Configuration

Run this command in PowerShell:
```powershell
cd "backend"
python test_email.py
```

If test passes, type `y` to send a test email to yourself.

### 4. Start the Application

**Terminal 1 (Backend):**
```powershell
cd backend
python run.py
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm start
```

### 5. Test 2FA

1. Go to: http://localhost:3000/login
2. Enter your email and password
3. You should receive a 6-digit code in your Gmail
4. Check **Spam folder** if not in inbox
5. Enter the code on the verification page

---

## What Was Fixed

### Issue 1: No Email Being Sent ✅
**Problem:** Email configuration was missing  
**Solution:** Added complete SMTP configuration to `.env`

### Issue 2: Email Not Displayed for Non-Existing Users ✅
**Problem:** Masked email was not shown on verification page  
**Solution:**
- Backend now sends `masked_email` in response
- Frontend displays it prominently at the top
- Format: `kh***@g.bracu.ac.bd`

---

## Verification Page Updates

For **non-existing emails**, the page now shows:

```
┌─────────────────────────────────┐
│  Verification code sent to:     │
│  kh***@g.bracu.ac.bd           │
│                                 │
│  Your Verification Code:        │
│  ┌─────────────────────────┐   │
│  │      1 2 3 4 5 6        │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

For **existing users**, email is sent to their inbox.

---

## Troubleshooting

### "Authentication Failed" Error
- ❌ Using regular Gmail password  
- ✅ Use App Password (16 characters, no spaces)

### Email Not Received
- Check Spam/Junk folder
- Verify email address is correct in user profile
- Check backend terminal for error messages

### Test Script Errors
- Make sure `.env` file is in `backend/` folder
- Ensure App Password has no spaces
- Verify 2-Step Verification is enabled

---

## Files Modified

1. **backend/.env** - Added email configuration
2. **backend/app/routes/auth.py** - Added masked_email for non-existing users
3. **frontend/src/pages/VerifyOTP.jsx** - Display email on verification page
4. **frontend/src/pages/Login1.jsx** - Pass masked_email to verification page
5. **backend/test_email.py** - New test script to verify email setup

---

## Need Help?

See detailed guide: `EMAIL_SETUP_GUIDE.md`

**Last Updated:** December 25, 2025
