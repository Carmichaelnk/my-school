#!/usr/bin/env python3
"""
Show user credentials for testing purposes
"""
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models.user import User
from app import db

def show_user_credentials():
    """Display all users with their login credentials"""
    app = create_app()
    
    with app.app_context():
        users = User.query.all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print("=" * 80)
        print("USER LOGIN CREDENTIALS")
        print("=" * 80)
        print(f"{'ID':<4} {'Email':<35} {'Role':<10} {'Verified':<8} {'Password':<15}")
        print("-" * 80)
        
        for user in users:
            # Note: In production, NEVER show actual passwords
            # This is only for testing purposes
            password_hint = "Use the password you set during registration"
            if hasattr(user, '_test_password'):
                password_hint = user._test_password
            else:
                # For testing, we'll show a generic password
                password_hint = "password123"
            
            print(f"{user.id:<4} {user.email:<35} {user.role:<10} {user.is_verified:<8} {password_hint:<15}")
        
        print("-" * 80)
        print(f"Total users: {len(users)}")
        print("\nNOTE: For newly registered users, use the password you entered during registration.")
        print("For older test users, try 'password123'")

if __name__ == '__main__':
    show_user_credentials()
