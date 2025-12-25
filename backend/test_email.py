"""
Test script to verify email configuration for 2FA
"""
import os
import sys
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
load_dotenv()

def test_email_config():
    """Test if email configuration is properly set up"""
    print("\n" + "="*60)
    print("EMAIL CONFIGURATION TEST")
    print("="*60 + "\n")
    
    # Check environment variables
    mail_server = os.environ.get('MAIL_SERVER')
    mail_port = os.environ.get('MAIL_PORT')
    mail_username = os.environ.get('MAIL_USERNAME')
    mail_password = os.environ.get('MAIL_PASSWORD')
    mail_use_tls = os.environ.get('MAIL_USE_TLS')
    
    print("📧 Email Configuration:")
    print(f"  Server: {mail_server or '❌ NOT SET'}")
    print(f"  Port: {mail_port or '❌ NOT SET'}")
    print(f"  Username: {mail_username or '❌ NOT SET'}")
    print(f"  Password: {'✓ SET (' + str(len(mail_password)) + ' chars)' if mail_password else '❌ NOT SET'}")
    print(f"  Use TLS: {mail_use_tls or '❌ NOT SET'}")
    
    if not all([mail_server, mail_port, mail_username, mail_password]):
        print("\n❌ Email configuration is INCOMPLETE!")
        print("\n📝 Follow these steps:")
        print("1. Open backend/.env file")
        print("2. Add your Gmail credentials:")
        print("   MAIL_USERNAME=your-email@gmail.com")
        print("   MAIL_PASSWORD=your-16-char-app-password")
        print("\n📖 See EMAIL_SETUP_GUIDE.md for detailed instructions")
        return False
    
    print("\n✓ Email configuration looks complete!")
    
    # Test SMTP connection
    print("\n" + "-"*60)
    print("Testing SMTP Connection...")
    print("-"*60)
    
    try:
        import smtplib
        
        with smtplib.SMTP(mail_server, int(mail_port)) as server:
            server.starttls()
            print("✓ TLS connection established")
            
            server.login(mail_username, mail_password)
            print("✓ Authentication successful")
            
        print("\n✅ SMTP connection test PASSED!")
        print(f"✅ Emails will be sent from: {mail_username}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ Authentication FAILED: {e}")
        print("\n💡 Common solutions:")
        print("1. Make sure you're using an App Password (not regular password)")
        print("2. Generate a new App Password in Google Account settings")
        print("3. Ensure 2-Step Verification is enabled on your Google account")
        return False
        
    except Exception as e:
        print(f"\n❌ Connection FAILED: {e}")
        print("\n💡 Possible issues:")
        print("1. Check your internet connection")
        print("2. Verify MAIL_SERVER and MAIL_PORT are correct")
        print("3. Check if your firewall is blocking port 587")
        return False

def test_send_sample_email():
    """Test sending a sample email"""
    print("\n" + "="*60)
    print("SAMPLE EMAIL TEST")
    print("="*60 + "\n")
    
    from app import create_app
    
    app = create_app()
    
    with app.app_context():
        from app.utils.email import send_otp_email
        
        mail_username = os.environ.get('MAIL_USERNAME')
        
        if not mail_username:
            print("❌ Cannot test - MAIL_USERNAME not configured")
            return False
        
        print(f"📧 Sending test email to: {mail_username}")
        print("   (sending to yourself for testing)")
        
        test_otp = "123456"
        success, error = send_otp_email(mail_username, test_otp, "Test User")
        
        if success:
            print("\n✅ Test email sent successfully!")
            print(f"📬 Check your inbox: {mail_username}")
            print(f"   Subject: EKA - Your Two-Factor Authentication Code")
            print(f"   OTP Code: {test_otp}")
            print("\n⚠️  Note: Email might be in spam/junk folder")
            return True
        else:
            print(f"\n❌ Failed to send test email: {error}")
            return False

if __name__ == '__main__':
    print("\n🧪 Testing EKA Email Configuration for 2FA\n")
    
    # Test configuration
    config_ok = test_email_config()
    
    if config_ok:
        # Ask if user wants to send a test email
        print("\n" + "="*60)
        response = input("\n📧 Do you want to send a test email? (y/n): ").strip().lower()
        
        if response == 'y':
            test_send_sample_email()
        else:
            print("\n✓ Configuration test complete. Skipping email send test.")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")
