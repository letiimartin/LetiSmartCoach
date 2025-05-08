import httpx
import json
import os

API_BASE_URL = "https://api.wahooligan.com/v1"

def load_tokens():
    with open("tokens.json", "r") as f:
        return json.load(f)

def get_headers():
    tokens = load_tokens()
    return {
        "Authorization": f"Bearer {tokens['access_token']}",
        "Content-Type": "application/json"
    }

async def get_workouts():
    url = f"{API_BASE_URL}/workouts"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers())
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Failed to fetch workouts: {response.text}"}
