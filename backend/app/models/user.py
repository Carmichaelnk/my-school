"""
User model for MySchool application
"""

from datetime import datetime, timedelta
import secrets
import random
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from app import db

class User(db.Model):
    """User model for authentication and profile management"""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    
    # Profile information
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    
    # User role and status
    role = db.Column(db.String(20), default='student')  # student, lecturer, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # OTP verification
    otp_code = db.Column(db.String(6))  # 6-digit OTP
    otp_expires_at = db.Column(db.DateTime)  # OTP expiration time
    otp_attempts = db.Column(db.Integer, default=0)  # Track failed attempts
    
    # Google OAuth
    google_id = db.Column(db.String(100), unique=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'))
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'profile_picture': self.profile_picture,
            'phone_number': self.phone_number,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def find_by_google_id(google_id):
        """Find user by Google ID"""
        return User.query.filter_by(google_id=google_id).first()
    
    def generate_otp(self):
        """Generate a 6-digit OTP code with 10-minute expiration"""
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        self.otp_attempts = 0
        return self.otp_code
    
    def verify_otp(self, provided_otp):
        """Verify the provided OTP code"""
        # Check if OTP exists and hasn't expired
        if not self.otp_code or not self.otp_expires_at:
            return False, "No OTP found. Please request a new one."
        
        if datetime.utcnow() > self.otp_expires_at:
            return False, "OTP has expired. Please request a new one."
        
        # Check attempt limit (max 5 attempts)
        if self.otp_attempts >= 5:
            return False, "Too many failed attempts. Please request a new OTP."
        
        # Verify OTP
        if self.otp_code == provided_otp:
            # Success - mark as verified and clear OTP
            self.is_verified = True
            self.otp_code = None
            self.otp_expires_at = None
            self.otp_attempts = 0
            return True, "Email verified successfully!"
        else:
            # Failed attempt
            self.otp_attempts += 1
            remaining_attempts = 5 - self.otp_attempts
            return False, f"Invalid OTP. {remaining_attempts} attempts remaining."
    
    def clear_otp(self):
        """Clear OTP data (for cleanup or new OTP generation)"""
        self.otp_code = None
        self.otp_expires_at = None
        self.otp_attempts = 0
    
    @staticmethod
    def detect_role_from_email(email):
        """Auto-detect user role based on email domain"""
        if email.endswith('@students.kcau.ac.ke') or email.endswith('@student.kcau.ac.ke'):
            return 'student'
        elif email.endswith('@kcau.ac.ke') or email.endswith('@staff.kcau.ac.ke'):
            return 'lecturer'
        else:
            return 'student'  # Default fallback
