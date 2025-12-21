# 🧪 Two-Factor Authentication Testing Guide

## Pre-Testing Checklist

### 1. Update Database
```bash
cd backend
python update_db_for_2fa.py
```

**Expected Output:**
```
✅ Database tables updated successfully!
✅ Added LoginOTP table for two-factor authentication
✅ Added TrustedDevice table for remembered devices
```

### 2. Restart Backend Server
```bash
cd backend
python run.py
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

---

## 🔍 Testing the Complete Flow

### Test 1: First Time Login (NEW Device)

#### Steps:
1. Open browser console (F12)
2. Navigate to login page
3. Enter your credentials
4. Click "Login"

#### Expected Console Output (Frontend):
```
=== LOGIN ATTEMPT ===
Email: user@example.com
Device fingerprint generated: Mozilla/5.0...
Sending login request...
Login API response: {requires_2fa: true, temp_token: "...", ...}
✓ 2FA Required - Redirecting to OTP page
Temp token received: Yes
OTP for testing: 123456

=== OTP VERIFICATION PAGE LOADED ===
Has temp token: true
Message: Verification code sent to user@example.com
OTP for testing: 123456
✓ Ready for OTP verification
```

#### Expected Backend Console Output:
```
=== LOGIN REQUEST ===
Email: user@example.com
Has device_fingerprint: True
User authenticated: 1 - user@example.com
Device hash: a1b2c3d4e5f6...
✗ Device not trusted, requiring 2FA

=== GENERATING 2FA OTP ===
User: user@example.com
OTP Code: 123456
Deleted 0 old unused OTPs
✓ OTP saved to database (expires: 2025-12-22 12:45:00)

📧 EMAIL SIMULATION: OTP for user@example.com: 123456

✓ Temporary token created (expires in 15 min)
=== END LOGIN (2FA REQUIRED) ===
```

#### What You Should See:
✅ Redirected to OTP verification page
✅ Message: "Verification code sent to your email"
✅ OTP code displayed in yellow box (testing mode)
✅ "Remember this device" checkbox visible
✅ Large input field for 6-digit code

---

### Test 2: Enter OTP Code

#### Steps:
1. Enter the 6-digit code shown on screen
2. Check "Remember this device" checkbox
3. Click "Verify"

#### Expected Console Output (Frontend):
```
=== SUBMITTING OTP ===
OTP Code: 123456
Remember device: true
Device fingerprint: Mozilla/5.0...
Device name: Chrome on Windows
Using temp token: Yes
✓ OTP Verified successfully
Response: {access_token: "...", user: {...}}
✓ Redirecting to home...
```

#### Expected Backend Console Output:
```
=== VERIFY OTP REQUEST ===
OTP Code received: 123456
Remember device: true
Has device fingerprint: true
User: user@example.com (ID: 1)
✓ OTP is valid
✓ OTP marked as used

=== SAVING TRUSTED DEVICE ===
Device hash: a1b2c3d4e5f6...
Device name: Chrome on Windows
✓ New trusted device saved
✓ Database committed
✓ Full access token created
=== VERIFY OTP SUCCESS ===
```

#### What You Should See:
✅ Successful verification
✅ Redirected to home page
✅ Logged in successfully
✅ User data displayed

---

### Test 3: Login Again (TRUSTED Device)

#### Steps:
1. Logout
2. Go to login page
3. Enter same credentials
4. Click "Login"

#### Expected Console Output (Frontend):
```
=== LOGIN ATTEMPT ===
Email: user@example.com
Device fingerprint generated: Mozilla/5.0...
Sending login request...
Login API response: {requires_2fa: false, access_token: "...", ...}
✓ Trusted device - No 2FA required
```

#### Expected Backend Console Output:
```
=== LOGIN REQUEST ===
Email: user@example.com
Has device_fingerprint: True
User authenticated: 1 - user@example.com
Device hash: a1b2c3d4e5f6...
✓ Trusted device found (last used: 2025-12-22 12:40:00)
```

#### What You Should See:
✅ **NO OTP page!** 
✅ Directly logged in
✅ Redirected to home immediately
✅ Like Gmail's "trusted device" behavior

---

### Test 4: New Browser/Incognito Mode

#### Steps:
1. Open **Incognito/Private** window
2. Go to login page
3. Enter credentials
4. Click "Login"

#### Expected Result:
✅ OTP verification required again (new device fingerprint)
✅ Can remember this device too

---

### Test 5: Invalid OTP

#### Steps:
1. Login (new device/incognito)
2. Enter WRONG OTP code
3. Click "Verify"

#### Expected Console Output (Frontend):
```
✗ OTP Verification error: ...
Error response: {error: "Invalid or expired OTP"}
```

#### Expected Backend Console Output:
```
✗ OTP not found or already used
```

#### What You Should See:
✅ Error message: "Invalid or expired OTP"
✅ Can try again
✅ OTP not consumed

---

### Test 6: Expired OTP

#### Steps:
1. Get OTP code
2. **Wait 10+ minutes** (or modify code to 1 minute for testing)
3. Try to verify

#### Expected Result:
✅ Error: "Invalid or expired OTP"
✅ Must login again to get new OTP

---

### Test 7: Doctor Account

#### Steps:
1. Login as doctor
2. Complete OTP verification
3. Check response

#### Expected Console Output:
```
ℹ Doctor account pending verification
```

#### What You Should See:
✅ OTP verification works same as regular user
✅ Alert message about pending verification (if not yet verified)

---

## 🐛 Troubleshooting

### Problem: OTP page doesn't load

**Check:**
- Console shows: `Has temp token: false`
- Backend returned `requires_2fa: true`?
- `temp_token` in response?

**Solution:**
- Check backend logs for errors
- Verify database tables exist
- Ensure JWT is configured

---

### Problem: OTP verification fails

**Check:**
- Backend console: "✗ OTP not found"
- Is OTP code correct?
- Is temp_token being sent?

**Solution:**
```javascript
// Check in browser console:
localStorage.getItem('token') // Should be null during OTP
```

---

### Problem: Device not remembered

**Check:**
- Backend logs: "⚠ Remember device checked but no device fingerprint"
- Frontend sending device_fingerprint?

**Solution:**
```javascript
// In browser console:
console.log(navigator.userAgent)
console.log(navigator.platform)
// Should show browser info
```

---

### Problem: "Authorization failed" error

**Check:**
- `temp_token` expired? (15 min limit)
- Token format correct?

**Solution:**
- Login again to get fresh temp_token
- Check Authorization header format

---

## 📊 Database Verification

### Check OTP Records:
```sql
SELECT * FROM login_otp WHERE user_id = 1;
```

**Expected:**
- `otp_code`: 6 digits
- `is_used`: 0 (before verification), 1 (after)
- `expires_at`: 10 minutes from creation

### Check Trusted Devices:
```sql
SELECT * FROM trusted_device WHERE user_id = 1;
```

**Expected:**
- `device_fingerprint`: SHA256 hash
- `device_name`: "Chrome on Windows"
- `ip_address`: Your IP
- `last_used`: Updated on each login

---

## ✅ Success Criteria

All these should work:

1. ✅ First login shows OTP page
2. ✅ OTP code displayed in testing mode
3. ✅ Correct OTP → successful login
4. ✅ Wrong OTP → error message
5. ✅ "Remember device" → next login skips OTP
6. ✅ New browser → requires OTP again
7. ✅ Backend logs show all steps
8. ✅ Frontend console shows flow
9. ✅ Database records created correctly
10. ✅ Works for both users and doctors

---

## 🎯 Testing Scenarios Summary

| Scenario | Expected Behavior |
|----------|------------------|
| **First login** | ✅ OTP required |
| **With "Remember device"** | ✅ Device saved |
| **Second login (same device)** | ✅ Skip OTP |
| **New browser** | ✅ OTP required |
| **Invalid OTP** | ✅ Error shown |
| **Expired OTP (10+ min)** | ✅ Error shown |
| **Doctor login** | ✅ OTP + verification message |

---

## 🔧 Quick Fixes

### Reset Everything:
```sql
-- Clear all OTPs
DELETE FROM login_otp;

-- Clear all trusted devices
DELETE FROM trusted_device;
```

### Test with Shorter Expiry (Development):
In `auth.py`, change:
```python
# From 10 minutes:
expires_at=datetime.utcnow() + timedelta(minutes=10)

# To 1 minute (for testing):
expires_at=datetime.utcnow() + timedelta(minutes=1)
```

### Disable Device Memory (Testing):
In Login component, comment out:
```javascript
// device_fingerprint: getDeviceFingerprint()
```
This forces OTP every time.

---

## 📝 Production Checklist

Before deploying:

1. ⚠️ **Remove OTP display:**
   - In `auth.py`, delete: `'otp_for_testing': otp_code`
   - In `VerifyOTP.jsx`, remove yellow testing box

2. ⚠️ **Configure email:**
   - Replace `print(f"OTP for {user.email}: {otp_code}")` with actual email sending

3. ⚠️ **Remove console.log:**
   - Clean up all debug logs in production

4. ✅ **Test in production-like environment**

5. ✅ **Monitor error logs**

---

## 🎉 When Everything Works

You should see:
- ✅ Clean login flow
- ✅ Professional OTP page
- ✅ Smooth "remember device" experience
- ✅ Detailed logs for debugging
- ✅ Secure device tracking
- ✅ Gmail-like user experience

**The system is working correctly when you can:**
1. Login and get OTP
2. Verify OTP successfully
3. Check "Remember device"
4. Login again WITHOUT OTP
5. Use new browser and need OTP again

---

## 📧 Need Help?

Check:
1. Backend terminal for detailed logs
2. Browser console for frontend flow
3. Database for stored records
4. Network tab for API responses

All logs are now comprehensive and will help you identify exactly where any issue occurs! 🎯
