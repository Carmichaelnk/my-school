"""
Test script to verify login functionality with detailed logging
"""
import requests
import json
import sys

def print_headers(headers):
    """Print request headers in a readable format"""
    print("\nRequest Headers:")
    for key, value in headers.items():
        print(f"  {key}: {value}")

def print_request(payload):
    """Print request payload in a readable format"""
    print("\nRequest Payload:")
    print(json.dumps(payload, indent=2))

def print_response(response):
    """Print response details"""
    print(f"\nResponse Status: {response.status_code}")
    print("Response Headers:")
    for key, value in response.headers.items():
        print(f"  {key}: {value}")
    
    try:
        print("\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
    except:
        print("\nResponse Text:")
        print(response.text)

def test_login(email, password):
    """Test login with given credentials"""
    url = "http://127.0.0.1:5001/api/auth/login"
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    
    payload = {
        'email': email,
        'password': password
    }
    
    print(f"\n{'='*80}")
    print(f"🔐 Testing login for: {email}")
    print('-'*80)
    
    try:
        # Print request details
        print_headers(headers)
        print_request(payload)
        
        # Make the request
        response = requests.post(
            url,
            headers=headers,
            data=json.dumps(payload)
        )
        
        # Print response details
        print_response(response)
        
        # Print summary
        print("\n" + "-"*40)
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN SUCCESSFUL!")
            print(f"👤 User: {data['user']['first_name']} {data['user']['last_name']}")
            print(f"🎭 Role: {data['user']['role'].title()}")
            print(f"🔑 Access Token: {data['access_token'][:20]}...")
        else:
            print("❌ LOGIN FAILED")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
                if 'details' in error_data:
                    print(f"Details: {error_data['details']}")
            except:
                print(f"Response: {response.text}")
        
        print('='*80)
        
    except Exception as e:
        print(f"\n❌ ERROR DURING LOGIN TEST: {str(e)}")
        print('='*80)
        import traceback
        traceback.print_exc()

def main():
    # Test student login
    test_login(
        email="1902909test1@students.kcau.ac.ke",
        password="password123"
    )
    
    # Test lecturer login
    test_login(
        email="lecturer1@kcau.ac.ke",
        password="password123"
    )
    
    # Test with wrong password
    test_login(
        email="1902909test1@students.kcau.ac.ke",
        password="wrongpassword"
    )

if __name__ == "__main__":
    main()
