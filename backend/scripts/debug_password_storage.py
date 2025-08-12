#!/usr/bin/env python3
"""
Debug password storage to see what's actually being saved
"""
import sys
import os
import json
import requests

def test_password_storage():
    """Test what happens when we register a user with a specific password"""
    
    # Test registration with a known password
    test_data = {
        "email": "testuser123@students.kcau.ac.ke",
        "username": "testuser123",
        "password": "TestPassword123",  # Note the capital T and P
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "+254712345678"
    }
    
    print("Testing password storage...")
    print(f"Original password: '{test_data['password']}'")
    print("-" * 50)
    
    try:
        # Send registration request
        response = requests.post(
            'http://localhost:5001/api/auth/register',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Registration response status: {response.status_code}")
        print(f"Registration response: {response.json()}")
        
        if response.status_code == 201:
            print("\n✓ Registration successful!")
            print("Now testing login with different password cases...")
            
            # Test login with different password variations
            login_tests = [
                "TestPassword123",  # Original (should work)
                "testpassword123",  # All lowercase
                "TESTPASSWORD123",  # All uppercase
                "testPassword123",  # Mixed case
            ]
            
            for test_password in login_tests:
                login_data = {
                    "email": test_data["email"],
                    "password": test_password
                }
                
                login_response = requests.post(
                    'http://localhost:5001/api/auth/login',
                    json=login_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                status = "✓ SUCCESS" if login_response.status_code == 200 else "✗ FAILED"
                print(f"Login with '{test_password}': {status}")
                
                if login_response.status_code != 200:
                    error_msg = login_response.json().get('error', 'Unknown error')
                    print(f"  Error: {error_msg}")
        
        else:
            print(f"Registration failed: {response.json()}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("Please make sure the Flask server is running on http://localhost:5001")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_password_storage()
