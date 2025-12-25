# Email Configuration Guide for 2FA

## Issue Fixed
1. ✅ Email configuration added to `.env` file
2. ✅ Masked email now displays on verification page for non-existing users
3. ✅ Proper email masking format (shows first 2-4 characters + domain)

## Setup Instructions for Gmail

### Step 1: Enable 2-Step Verification on Your Google Account

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click on **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification if not already enabled

### Step 2: Generate an App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on **2-Step Verification**
3. Scroll down to **App passwords** (you may need to sign in again)
4. Select app: **Mail**
5. Select device: **Other (Custom name)** - enter "EKA Mental Wellness"
6. Click **Generate**
7. Google will show you a 16-character password (like: `abcd efgh ijkl mnop`)
8. **Copy this password immediately** (you won't be able to see it again)

### Step 3: Update the `.env` File

Open `backend/.env` and update the following values:

```env
# Replace these with your actual Gmail credentials
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

**Example:**
```env
MAIL_USERNAME=john.doe@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
MAIL_DEFAULT_SENDER=john.doe@gmail.com
```

⚠️ **IMPORTANT:** Use the 16-character App Password, NOT your regular Gmail password!

### Step 4: Test the Configuration

1. **Start the backend server:**
   ```bash
   cd backend
   python run.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test the login flow:**
   - Go to the login page
   - Enter a valid email and password
   - You should receive a verification code in your Gmail inbox
   - Check your spam/junk folder if you don't see it in the inbox

## Email Features

### For Existing Users
- Verification code is sent to the registered email
- Email shows first 2 characters + domain (e.g., `kh***@g.bracu.ac.bd`)
- Professional HTML email with EKA branding

### For Non-Existing Users
- Verification code is displayed on the webpage (no email sent)
- Shows masked email at the top of the verification page
- Code is visible for 15 minutes

## Troubleshooting

### Email Not Being Sent

1. **Check if credentials are correct:**
   - Verify MAIL_USERNAME is your full Gmail address
   - Verify MAIL_PASSWORD is the 16-character App Password (no spaces)

2. **Check backend logs:**
   - Look for email-related error messages
   - Common errors:
     - `SMTP Authentication Error` - Wrong credentials
     - `Recipient Refused` - Invalid email address
     - `Connection Timeout` - Firewall/network issue

3. **Verify Gmail settings:**
   - Make sure 2-Step Verification is enabled
   - Make sure App Password is generated correctly
   - Try generating a new App Password if needed

4. **Check firewall/antivirus:**
   - Ensure port 587 (SMTP) is not blocked
   - Add Python to firewall exceptions if needed

### Testing Mode

In development, you can see the OTP code in the API response:
- Set `TESTING_MODE=true` in `.env`
- Set `FLASK_ENV=development` in `.env`
- The OTP will be included in the login response (visible in browser console)

## Email Template

The system sends a professional HTML email with:
- EKA branding and gradient header
- Large, easy-to-read OTP code
- Security warning
- 10-minute expiration notice
- Mobile-friendly responsive design

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **App Passwords are safer than regular passwords** - They can be revoked individually
3. **Revoke unused App Passwords** - Check periodically and remove old ones
4. **OTP expires in 10 minutes** - For security
5. **One-time use** - Each OTP can only be used once

## Support

If you continue to have issues:
1. Check the backend terminal for detailed error messages
2. Verify all environment variables are set correctly
3. Try with a different Gmail account to rule out account-specific issues
4. Check if your Gmail account has any security restrictions

---

**Last Updated:** December 25, 2025
