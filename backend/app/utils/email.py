"""
Email service for MySchool application
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app, url_for


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_otp_email(user_email, otp_code, user_name, user_role):
        """Send OTP code to user for email verification"""
        try:
            # For development, we'll just log the verification link
            # In production, you'd configure actual SMTP settings
            
            subject = "MySchool - Your Verification Code"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .button {{ 
                        display: inline-block; 
                        background: #2563eb; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }}
                    .footer {{ text-align: center; padding: 20px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 MySchool</h1>
                        <p>Welcome to Your Learning Journey</p>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name}!</h2>
                        <p>Thank you for registering with MySchool as a <strong>{user_role}</strong>. To complete your registration, please enter the verification code below in your MySchool app:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background: #f3f4f6; border: 2px dashed #2563eb; padding: 20px; border-radius: 10px; display: inline-block;">
                                <h1 style="font-size: 36px; color: #2563eb; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">{otp_code}</h1>
                            </div>
                        </div>
                        
                        <p style="text-align: center;"><strong>Your 6-digit verification code:</strong></p>
                        <p style="text-align: center; font-size: 24px; font-weight: bold; color: #2563eb; background: #f9fafb; padding: 15px; border-radius: 8px; letter-spacing: 3px; font-family: 'Courier New', monospace;">{otp_code}</p>
                        
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This code expires in <strong>10 minutes</strong></li>
                            <li>Enter this code in your MySchool app to verify your email</li>
                            <li>You have 5 attempts to enter the correct code</li>
                            <li>Do not share this code with anyone</li>
                        </ul>
                        
                        <p>If you didn't create this account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MySchool - Your Educational Platform</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # For development: Log the email content instead of sending
            print("\n" + "="*60)
            print("📧 OTP VERIFICATION EMAIL (Development Mode)")
            print("="*60)
            print(f"To: {user_email}")
            print(f"Subject: {subject}")
            print(f"User Role: {user_role}")
            print(f"OTP CODE: {otp_code}")
            print("="*60)
            print("✅ OTP email would be sent in production")
            print("="*60 + "\n")
            
            # In production, you would configure SMTP and send the actual email:
            # smtp_server = os.environ.get('SMTP_SERVER')
            # smtp_port = int(os.environ.get('SMTP_PORT', 587))
            # smtp_username = os.environ.get('SMTP_USERNAME')
            # smtp_password = os.environ.get('SMTP_PASSWORD')
            
            return True
            
        except Exception as e:
            print(f"Error sending verification email: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(user_email, user_name, user_role):
        """Send welcome email after successful verification"""
        try:
            subject = "MySchool - Welcome! Your Account is Active"
            
            role_message = "student" if user_role == "student" else "lecturer"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #16a34a; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .footer {{ text-align: center; padding: 20px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to MySchool!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name}!</h2>
                        <p>Congratulations! Your email has been verified and your MySchool {role_message} account is now active.</p>
                        
                        <p>You can now log in to your MySchool app and start your learning journey!</p>
                        
                        <p><strong>What's next?</strong></p>
                        <ul>
                            <li>Log in to your MySchool mobile app</li>
                            <li>Complete your profile</li>
                            <li>Explore courses and features</li>
                            <li>Connect with your academic community</li>
                        </ul>
                        
                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MySchool - Your Educational Platform</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # For development: Log the welcome email
            print("\n" + "="*60)
            print("🎉 WELCOME EMAIL (Development Mode)")
            print("="*60)
            print(f"To: {user_email}")
            print(f"Subject: {subject}")
            print("="*60 + "\n")
            
            return True
            
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")
            return False
