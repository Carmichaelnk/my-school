"""
Script to list all users and their verification status
"""
import sys
import os
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models.user import User

def list_users():
    """List all users and their verification status"""
    # Create app context
    app = create_app()
    with app.app_context():
        # Query all users
        users = User.query.all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print("\n" + "="*100)
        print(f"{'ID':<5} | {'Email':<35} | {'Role':<10} | {'Verified':<8} | {'Created At'}")
        print("-" * 70)
        
        for user in users:
            print(f"{user.id:<5} | {user.email:<35} | {user.role or 'N/A':<10} | "
                  f"{'✅' if user.is_verified else '❌':<8} | {user.created_at}")
        
        # Count verified and unverified users
        verified_count = sum(1 for u in users if u.is_verified)
        
        print("\n" + "="*70)
        print(f"Total users: {len(users)}")
        print(f"Verified users: {verified_count}")
        print(f"Unverified users: {len(users) - verified_count}")
        print("="*70 + "\n")

if __name__ == "__main__":
    list_users()
