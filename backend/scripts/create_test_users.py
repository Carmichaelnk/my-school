"""
Script to create test users for MySchool application.
Run with: python -m scripts.create_test_users
"""
import os
import sys
from datetime import datetime, timedelta

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User

def create_test_user(email, password, first_name, last_name, role='student'):
    """Create a test user with the given credentials"""
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        print(f"User {email} already exists. Skipping...")
        return
    
    # Create new user
    user = User(
        email=email,
        username=email.split('@')[0],  # Use the part before @ as username
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_verified=True,  # Skip email verification for test users
        is_active=True
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    print(f"Created user: {email}")

def main():
    # Create Flask app and push app context
    app = create_app()
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Create test users
        test_users = [
            {
                'email': '1902909test1@students.kcau.ac.ke',
                'password': 'password123',
                'first_name': 'Test',
                'last_name': 'User 1',
                'role': 'student'
            },
            {
                'email': 'lecturer1@kcau.ac.ke',
                'password': 'password123',
                'first_name': 'Test',
                'last_name': 'Lecturer',
                'role': 'lecturer'
            }
        ]
        
        for user_data in test_users:
            create_test_user(**user_data)
        
        print("\nTest users created successfully!")
        print("\nTest Student Credentials:")
        print("Email: 1902909test1@students.kcau.ac.ke")
        print("Password: password123")
        print("\nTest Lecturer Credentials:")
        print("Email: lecturer1@kcau.ac.ke")
        print("Password: password123")

if __name__ == "__main__":
    main()
