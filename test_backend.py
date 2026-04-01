import requests
import json

def test_search():
    url = "http://127.0.0.1:8000/search-jobs"
    data = {
        "query": "Junior Full Stack Developer in Jaipur, remote friendly, MERN stack",
        "headless": True
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Note: Make sure the server is running before executing this script
    test_search()
