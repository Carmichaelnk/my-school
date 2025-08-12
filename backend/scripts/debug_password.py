"""
Debug script to test password hashing and verification
"""
import sys
import os
from werkzeug.security import generate_password_hash, check_password_hash

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User

def debug_password(email, password):
    """Debug password hashing and verification"""
    print(f"\n{'='*60}")
    print(f"Debugging password for: {email}")
    print('-'*60)
    
    # Get the user from the database
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"❌ User {email} not found in the database")
        return
    
    print(f"✅ User found: {user.email}")
    print(f"Password hash in DB: {user.password_hash}")
    
    # Test password verification
    is_correct = user.check_password(password)
    print(f"Password check result: {'✅ Correct' if is_correct else '❌ Incorrect'}")
    
    # Test direct verification with the same hash
    if user.password_hash:
        direct_check = check_password_hash(user.password_hash, password)
        print(f"Direct check with check_password_hash: {'✅ Correct' if direct_check else '❌ Incorrect'}")
        
        # Generate a new hash for comparison
        new_hash = generate_password_hash(password)
        print(f"\nNew hash for comparison: {new_hash}")
        print(f"New hash matches stored hash: {'✅' if new_hash == user.password_hash else '❌ No'}")
        
        # Check if the stored hash is a valid hash
        try:
            check_password_hash(user.password_hash, 'wrongpassword')
            print("✅ Stored hash appears to be a valid password hash")
        except Exception as e:
            print(f"❌ Stored hash is NOT a valid password hash: {str(e)}")
    
    print('='*60)

def main():
    # Create Flask app and push app context
    app = create_app()
    with app.app_context():
        # Test with our test users
        test_users = [
            '1902909test1@students.kcau.ac.ke',
            'lecturer1@kcau.ac.ke'
        ]
        
        for email in test_users:
            debug_password(email, 'password123')

if __name__ == "__main__":
    main()
