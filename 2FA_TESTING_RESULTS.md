# 2FA Testing Guide

## Test Scenarios

### Test 1: Login with EXISTING user
**Credentials:**
- Email: testlogin@test.com
- Password: Test123!

**Expected Result:**
1. Enter email and password on login page
2. Click Login
3. Should redirect to OTP verification page
4. OTP should be sent to email (check backend logs)
5. OTP should also be shown on the page in testing mode
6. Enter the OTP code
7. Should successfully login

### Test 2: Login with NON-EXISTING user
**Credentials:**
- Email: nonexistent@test.com
- Password: any password

**Expected Result:**
1. Enter email and password on login page
2. Click Login
3. Should redirect to OTP verification page
4. OTP should be displayed prominently at the TOP of the page in a colored box
5. Message should indicate "Email not found in our system"
6. Enter the displayed OTP code
7. Should show error: "Email not found. Please sign up first."
8. After 2 seconds, should redirect to signup page

## Testing Steps

1. Open http://localhost:3000/login
2. Test Scenario 1 first (existing user)
3. Test Scenario 2 second (non-existing user)

## Backend Logs
Watch the backend terminal for detailed logs showing:
- Login attempts
- OTP generation
- Email sending status
- OTP verification attempts
