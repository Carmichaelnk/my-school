"""
Authentication views for MySchool application
Handles user registration, login, and Google OAuth
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from datetime import datetime

from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password, validate_institutional_email
from app.utils.email import EmailService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Auto-detect user role from email domain
        user_role = User.detect_role_from_email(data['email'])
        
        # Validate institutional email format
        is_valid, message = validate_institutional_email(data['email'], user_role)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Debug: Log the received password (remove this in production)
        print(f"DEBUG: Received password: '{data['password']}'")
        print(f"DEBUG: Password length: {len(data['password'])}")
        print(f"DEBUG: First character: '{data['password'][0]}' (ASCII: {ord(data['password'][0])})")
        
        # Validate password strength
        if not validate_password(data['password']):
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Check if user already exists
        if User.find_by_email(data['email']):
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.find_by_username(data['username']):
            return jsonify({'error': 'Username already taken'}), 409
        
        # Create new user with email verification required
        user = User(
            email=data['email'].lower().strip(),
            username=data['username'].strip(),
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            phone_number=data.get('phone_number', '').strip(),
            role=user_role,  # Use auto-detected role
            is_verified=False  # Email verification required
        )
        user.set_password(data['password'])
        
        # Generate OTP code
        otp_code = user.generate_otp()
        
        db.session.add(user)
        db.session.commit()
        
        # Send OTP email
        email_sent = EmailService.send_otp_email(
            user.email, 
            otp_code, 
            f"{user.first_name} {user.last_name}",
            user_role
        )
        
        if not email_sent:
            # If email fails, still allow registration but warn user
            return jsonify({
                'message': 'Registration successful, but verification email failed to send. Please contact support.',
                'email_sent': False,
                'verification_required': True
            }), 201
        
        return jsonify({
            'message': 'Registration successful! Please check your email for a 6-digit verification code.',
            'email_sent': True,
            'otp_required': True,
            'user_role': user_role,
            'user_id': user.id  # Frontend will need this for OTP verification
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP code and complete registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('user_id') or not data.get('otp_code'):
            return jsonify({'error': 'User ID and OTP code are required'}), 400
        
        # Find user
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already verified
        if user.is_verified:
            return jsonify({'error': 'Email already verified'}), 400
        
        # Verify OTP
        is_valid, message = user.verify_otp(data['otp_code'])
        
        if not is_valid:
            db.session.commit()  # Save failed attempt count
            return jsonify({'error': message}), 400
        
        # OTP verified successfully - update user and create tokens
        db.session.commit()
        
        # Send welcome email
        EmailService.send_welcome_email(
            user.email,
            f"{user.first_name} {user.last_name}",
            user.role
        )
        
        # Create JWT tokens for immediate login
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Email verified successfully! Welcome to MySchool!',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'OTP verification failed', 'details': str(e)}), 500

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP code to user's email"""
    try:
        data = request.get_json()
        
        if not data.get('user_id'):
            return jsonify({'error': 'User ID is required'}), 400
        
        # Find user
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is already verified
        if user.is_verified:
            return jsonify({'error': 'Email already verified'}), 400
        
        # Generate new OTP
        otp_code = user.generate_otp()
        db.session.commit()
        
        # Send new OTP email
        email_sent = EmailService.send_otp_email(
            user.email,
            otp_code,
            f"{user.first_name} {user.last_name}",
            user.role
        )
        
        if not email_sent:
            return jsonify({'error': 'Failed to send OTP email'}), 500
        
        return jsonify({
            'message': 'New OTP code sent to your email',
            'email_sent': True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resend OTP', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Validate institutional email format (basic check)
        email = data['email'].lower().strip()
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Find user by email
        user = User.find_by_email(email)
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Check if email is verified
        if not user.is_verified:
            return jsonify({
                'error': 'Email not verified. Please verify your email before logging in.',
                'verification_required': True,
                'user_id': user.id
            }), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/google/url', methods=['GET'])
def google_auth_url():
    """Get Google OAuth URL for frontend"""
    try:
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        if not client_id:
            return jsonify({'error': 'Google OAuth not configured'}), 500
            
        # Construct Google OAuth URL
        redirect_uri = request.host_url.rstrip('/') + '/api/auth/google/callback'
        scope = 'openid email profile'
        
        google_auth_url = (
            f"https://accounts.google.com/o/oauth2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"scope={scope}&"
            f"response_type=code&"
            f"access_type=offline"
        )
        
        return jsonify({
            'auth_url': google_auth_url,
            'redirect_uri': redirect_uri
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to generate Google auth URL', 'details': str(e)}), 500

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Google OAuth authentication endpoint"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token
        try:
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), os.environ.get('GOOGLE_CLIENT_ID')
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
                
        except ValueError:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        # Extract user info from Google
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        profile_picture = idinfo.get('picture', '')
        
        # Check if user exists
        user = User.find_by_google_id(google_id)
        
        if not user:
            # Check if user exists with same email
            user = User.find_by_email(email)
            if user:
                # Link Google account to existing user
                user.google_id = google_id
                if not user.profile_picture:
                    user.profile_picture = profile_picture
            else:
                # Create new user
                username = email.split('@')[0]  # Use email prefix as username
                counter = 1
                original_username = username
                
                # Ensure unique username
                while User.find_by_username(username):
                    username = f"{original_username}{counter}"
                    counter += 1
                
                user = User(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    profile_picture=profile_picture,
                    is_verified=True  # Google accounts are pre-verified
                )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'message': 'Google authentication successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Google authentication failed', 'details': str(e)}), 500

@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Handle Google OAuth callback"""
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({'error': 'Authorization code not provided'}), 400
            
        # Exchange code for tokens
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
        redirect_uri = request.host_url.rstrip('/') + '/api/auth/google/callback'
        
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if 'access_token' not in token_json:
            return jsonify({'error': 'Failed to get access token'}), 400
            
        # Get user info from Google
        access_token = token_json['access_token']
        user_info_url = f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        user_response = requests.get(user_info_url)
        user_info = user_response.json()
        
        # Extract user data
        google_id = user_info['id']
        email = user_info['email']
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        profile_picture = user_info.get('picture', '')
        
        # Check if user exists
        user = User.find_by_google_id(google_id)
        
        if not user:
            # Check if user exists with same email
            user = User.find_by_email(email)
            if user:
                # Link Google account to existing user
                user.google_id = google_id
                if not user.profile_picture:
                    user.profile_picture = profile_picture
            else:
                # Create new user
                username = email.split('@')[0]
                counter = 1
                original_username = username
                
                # Ensure unique username
                while User.find_by_username(username):
                    username = f"{original_username}{counter}"
                    counter += 1
                
                user = User(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_id,
                    profile_picture=profile_picture,
                    is_verified=True
                )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.add(user)
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # Return success page with tokens (for web flow)
        return f"""
        <html>
        <head><title>Authentication Successful</title></head>
        <body>
            <h1>Authentication Successful!</h1>
            <p>You can close this window and return to the app.</p>
            <script>
                // For mobile apps, you can extract these tokens
                const tokens = {{
                    access_token: '{access_token}',
                    refresh_token: '{refresh_token}',
                    user: {user.to_dict()}
                }};
                console.log('Auth tokens:', tokens);
            </script>
        </body>
        </html>
        """
        
    except Exception as e:
        return jsonify({'error': 'Google callback failed', 'details': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token endpoint"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get user info', 'details': str(e)}), 500
