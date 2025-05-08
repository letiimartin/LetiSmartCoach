import httpx
import json
import os
from dotenv import load_dotenv
from auth_utils import load_tokens, save_tokens

load_dotenv()

CLIENT_ID = os.getenv("WAHOO_CLIENT_ID")
CLIENT_SECRET = os.getenv("WAHOO_CLIENT_SECRET")
TOKEN_URL = "https://api.wahooligan.com/oauth/token"
WORKOUTS_URL = "https://api.wahooligan.com/v1/workouts"

async def refresh_access_token(refresh_token):
    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        })
    if response.status_code == 200:
        new_tokens = response.json()
        save_tokens(new_tokens)
        return new_tokens["access_token"]
    else:
        return None

async def get_workouts(activity_type: str = None, min_date: str = None, min_duration: int = None):
    tokens = load_tokens()
    if not tokens:
        return {"error": "No tokens found"}

    access_token = tokens["access_token"]
    refresh_token_value = tokens["refresh_token"]
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(WORKOUTS_URL, headers=headers)

        if response.status_code == 401:
            new_access_token = await refresh_access_token(refresh_token_value)
            if not new_access_token:
                return {"error": "Token refresh failed"}
            headers = {"Authorization": f"Bearer {new_access_token}"}
            response = await client.get(WORKOUTS_URL, headers=headers)

        if response.status_code == 200:
            workouts = response.json()

            # Aplica filtros si se proporcionan
            filtered = []
            for w in workouts:
                if activity_type and w.get("sport") != activity_type:
                    continue
                if min_date and w.get("start_time") < min_date:
                    continue
                if min_duration and w.get("duration") < (min_duration * 60):
                    continue
                filtered.append(w)

            return filtered

        else:
            return {"error": f"Failed to fetch workouts: {response.text}"}
