"""
Email utilities for sending 2FA OTP codes and other notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
import re

def is_valid_email(email):
    """Check if email address has valid format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def send_otp_email(to_email, otp_code, user_name=None):
    """
    Send OTP code via email
    
    Args:
        to_email (str): Recipient email address
        otp_code (str): The 6-digit OTP code
        user_name (str, optional): User's name for personalization
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    try:
        # Validate email format first
        if not is_valid_email(to_email):
            print(f"❌ Invalid email format: {to_email}")
            return False, "Invalid email address format"
        
        # Get email configuration
        mail_server = current_app.config.get('MAIL_SERVER')
        mail_port = current_app.config.get('MAIL_PORT')
        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_password = current_app.config.get('MAIL_PASSWORD')
        mail_use_tls = current_app.config.get('MAIL_USE_TLS')
        mail_default_sender = current_app.config.get('MAIL_DEFAULT_SENDER', mail_username)
        
        # Check if email is configured
        if not all([mail_server, mail_username, mail_password]):
            print("⚠ Email not configured - would send to:", to_email)
            print(f"📧 OTP CODE: {otp_code}")
            return True, None  # Return success in development mode
        
        print(f"\n=== SENDING EMAIL ===")
        print(f"From: {mail_default_sender}")
        print(f"To: {to_email}")
        print(f"Server: {mail_server}:{mail_port}")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'EKA - Your Two-Factor Authentication Code'
        msg['From'] = mail_default_sender
        msg['To'] = to_email
        
        # Create the email content
        greeting = f"Hello {user_name}," if user_name else "Hello,"
        
        text_content = f"""
{greeting}

Your verification code for EKA (Ease. Kindness. Awareness) is:

{otp_code}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email or contact support if you have concerns.

Best regards,
EKA Team
        """
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .otp-code {{
            background: white;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            margin: 20px 0;
        }}
        .warning {{
            color: #856404;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 12px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 14px;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🧠 EKA</h2>
            <p style="margin: 0;">Ease. Kindness. Awareness</p>
        </div>
        <div class="content">
            <p>{greeting}</p>
            <p>Your verification code for two-factor authentication is:</p>
            <div class="otp-code">{otp_code}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request this code, please ignore this email or contact our support team immediately.
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from EKA Mental Wellness Platform.</p>
            <p>&copy; 2024 EKA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Attach both plain text and HTML versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        try:
            with smtplib.SMTP(mail_server, mail_port) as server:
                if mail_use_tls:
                    server.starttls()
                server.login(mail_username, mail_password)
                server.send_message(msg)
            
            print(f"✓ Email sent successfully to {to_email}")
            return True, None
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = "Email authentication failed. Please check email credentials."
            print(f"❌ SMTP Authentication Error: {e}")
            return False, error_msg
            
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = "Invalid recipient email address."
            print(f"❌ Recipient Refused: {e}")
            return False, error_msg
            
        except smtplib.SMTPException as e:
            error_msg = f"Failed to send email: {str(e)}"
            print(f"❌ SMTP Error: {e}")
            return False, error_msg
            
    except Exception as e:
        error_msg = f"Email error: {str(e)}"
        print(f"❌ EMAIL ERROR: {e}")
        import traceback
        print(traceback.format_exc())
        return False, error_msg


def send_welcome_email(to_email, user_name):
    """Send welcome email to new users (optional feature)"""
    try:
        if not is_valid_email(to_email):
            return False, "Invalid email address format"
        
        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_password = current_app.config.get('MAIL_PASSWORD')
        
        if not all([mail_username, mail_password]):
            print("⚠ Email not configured - skipping welcome email")
            return True, None
        
        # Implementation for welcome email...
        print(f"✓ Welcome email would be sent to {to_email}")
        return True, None
        
    except Exception as e:
        print(f"❌ Welcome email error: {e}")
        return False, str(e)
