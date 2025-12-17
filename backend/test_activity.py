"""
Test script to verify activity endpoints and data
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:5050/api'

def test_activity_endpoint():
    print("=" * 60)
    print("Testing Activity Endpoint")
    print("=" * 60)
    
    # First, login to get a token
    print("\n1. Logging in as a test user...")
    login_data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')  # Changed from 'token' to 'access_token'
            if not token:
                print(f"❌ No token in response: {data}")
                return False
                
            print(f"✅ Login successful! Token: {token[:20]}...")
            
            # Test activity endpoint
            print("\n2. Fetching activity data...")
            headers = {'Authorization': f'Bearer {token}'}
            activity_response = requests.get(f'{BASE_URL}/activity/my', headers=headers)
            
            if activity_response.status_code == 200:
                data = activity_response.json()
                print("✅ Activity data retrieved successfully!")
                print(f"\n📊 Summary:")
                print(f"   Mood Entries: {data['summary']['total_mood_entries']}")
                print(f"   Journals: {data['summary']['total_journals']}")
                print(f"   Articles Read: {data['summary']['total_articles_read']}")
                print(f"   Articles Liked: {data['summary']['total_articles_liked']}")
                print(f"   Comments: {data['summary']['total_article_comments']}")
                print(f"   Avg Mood: {data['summary']['avg_mood_level']:.2f}/5")
                
                print(f"\n📈 Timeline Data:")
                print(f"   Mood Timeline: {len(data.get('mood_timeline', []))} entries")
                print(f"   Journal Timeline: {len(data.get('journal_timeline', {}))} days")
                print(f"   Articles Read Timeline: {len(data.get('articles_read_timeline', {}))} days")
                
                return True
            else:
                print(f"❌ Failed to get activity data: {activity_response.status_code}")
                print(f"   Response: {activity_response.text}")
                return False
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            print("\n💡 Note: If no test user exists, please create one first.")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    test_activity_endpoint()
    print("\n" + "=" * 60)
