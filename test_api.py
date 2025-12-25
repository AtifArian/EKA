import requests
import json
import time

BASE_URL = "http://127.0.0.1:5050"

def test_existing_user():
    print("\n" + "="*70)
    print("TEST 1: Login with EXISTING user (testlogin@test.com)")
    print("="*70)
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "testlogin@test.com",
            "password": "Test123!"
        }
    )
    
    print(f"\nStatus Code: {response.status_code}")
    data = response.json()
    print(f"Response:")
    print(json.dumps(data, indent=2))
    
    if data.get('requires_2fa'):
        print("\n✓ SUCCESS: 2FA required")
        print(f"✓ Temp token received: {bool(data.get('temp_token'))}")
        if data.get('otp_for_testing'):
            print(f"✓ OTP for testing: {data['otp_for_testing']}")
        if data.get('message'):
            print(f"✓ Message: {data['message']}")
        return True
    else:
        print("\n✗ FAILED: 2FA not required")
        return False

def test_nonexisting_user():
    print("\n" + "="*70)
    print("TEST 2: Login with NON-EXISTING user (nonexistent@test.com)")
    print("="*70)
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "anypassword"
        }
    )
    
    print(f"\nStatus Code: {response.status_code}")
    data = response.json()
    print(f"Response:")
    print(json.dumps(data, indent=2))
    
    if data.get('requires_2fa') and data.get('otp_code') and data.get('email_not_found'):
        print("\n✓ SUCCESS: Email not found, OTP shown on website")
        print(f"✓ OTP Code: {data['otp_code']}")
        print(f"✓ Email not found flag: {data['email_not_found']}")
        print(f"✓ Message: {data['message']}")
        return True
    else:
        print("\n✗ FAILED: Expected OTP code and email_not_found flag")
        return False

if __name__ == "__main__":
    try:
        test1_passed = test_existing_user()
        time.sleep(1)
        test2_passed = test_nonexisting_user()
        
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)
        print(f"Test 1 (Existing User): {'✓ PASSED' if test1_passed else '✗ FAILED'}")
        print(f"Test 2 (Non-existing User): {'✓ PASSED' if test2_passed else '✗ FAILED'}")
        print("\n" + "="*70)
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
