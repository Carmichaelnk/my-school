#!/usr/bin/env python3
"""
Test password case sensitivity
"""
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models.user import User
from app import db

def test_password_case():
    """Test password case sensitivity"""
    app = create_app()
    
    with app.app_context():
        # Find a test user
        user = User.query.filter_by(email='lecturer1@kcau.ac.ke').first()
        
        if not user:
            print("User 'lecturer1@kcau.ac.ke' not found")
            return
        
        print(f"Testing password case sensitivity for user: {user.email}")
        print(f"User role: {user.role}")
        print(f"User verified: {user.is_verified}")
        
        # Test different password cases
        test_passwords = [
            'password123',
            'Password123', 
            'PASSWORD123',
            'PassWord123',
            'pAssWoRd123'
        ]
        
        print("\nTesting password variations:")
        print("-" * 40)
        
        for pwd in test_passwords:
            result = user.check_password(pwd)
            print(f"'{pwd}' -> {'✓ VALID' if result else '✗ INVALID'}")
        
        # Let's also check what the actual password hash looks like
        print(f"\nStored password hash: {user.password_hash}")
        
        # Test setting a new password with mixed case
        print("\nTesting password setting with mixed case...")
        test_user = User(
            email='test@example.com',
            username='testuser',
            first_name='Test',
            last_name='User',
            role='student'
        )
        
        mixed_case_password = 'TestPassword123'
        test_user.set_password(mixed_case_password)
        
        print(f"Set password: '{mixed_case_password}'")
        print(f"Generated hash: {test_user.password_hash}")
        
        # Test verification
        print("\nTesting verification of mixed case password:")
        test_cases = [
            'TestPassword123',  # Exact match
            'testpassword123',  # All lowercase
            'TESTPASSWORD123',  # All uppercase
            'testPassword123'   # Different case
        ]
        
        for pwd in test_cases:
            result = test_user.check_password(pwd)
            print(f"'{pwd}' -> {'✓ VALID' if result else '✗ INVALID'}")

if __name__ == '__main__':
    test_password_case()
