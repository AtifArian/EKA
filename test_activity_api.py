import requests
import json

# Test the activity API with different time periods
BASE_URL = "http://127.0.0.1:5050/api"

# You'll need to login first to get a token
# For testing, use your actual token here
TOKEN = "your_token_here"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Test different time periods
test_periods = ['7', '15', '30', '2024', '2025', 'all']

for period in test_periods:
    print(f"\n{'='*50}")
    print(f"Testing time_period: {period}")
    print('='*50)
    
    response = requests.get(
        f"{BASE_URL}/activity/my?time_period={period}",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Success!")
        print(f"  period_type: {data.get('period_type')}")
        print(f"  time_period: {data.get('time_period')}")
        print(f"  date_range: {data.get('date_range')}")
        print(f"  mood entries: {len(data.get('mood_timeline', []))}")
        print(f"  journal entries: {len(data.get('journal_list', []))}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(f"  {response.text}")

print(f"\n{'='*50}")
print("Test complete!")
