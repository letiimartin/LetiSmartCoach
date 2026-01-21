import httpx
import json
import os
from dotenv import load_dotenv
from supabase_client import get_supabase_client
from collections import defaultdict
from datetime import datetime, timedelta
import pytz

load_dotenv()

CLIENT_ID = os.getenv("WAHOO_CLIENT_ID")
CLIENT_SECRET = os.getenv("WAHOO_CLIENT_SECRET")
TOKEN_URL = "https://api.wahooligan.com/oauth/token"
WORKOUTS_URL = "https://api.wahooligan.com/v1/workouts"

supabase = get_supabase_client()

async def get_user_tokens(user_id: str):
    response = supabase.table("wahoo_tokens").select("*").eq("user_id", user_id).execute()
    if not response.data:
        return None
    return response.data[0]

async def save_user_tokens(user_id: str, token_data: dict):
    expires_at = datetime.now(pytz.utc) + timedelta(seconds=token_data["expires_in"])
    data = {
        "user_id": user_id,
        "access_token_enc": token_data["access_token"],
        "refresh_token_enc": token_data["refresh_token"],
        "expires_at": expires_at.isoformat(),
        "scope": token_data.get("scope")
    }
    supabase.table("wahoo_tokens").upsert(data).execute()

async def refresh_access_token(user_id: str, refresh_token):
    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET
        })
    if response.status_code == 200:
        new_tokens = response.json()
        await save_user_tokens(user_id, new_tokens)
        return new_tokens["access_token"]
    else:
        return None

async def get_workouts(user_id: str, activity_type: str = None, min_date: str = None, min_duration: int = None):
    tokens = await get_user_tokens(user_id)
    if not tokens:
        return {"error": "User not connected to Wahoo"}

    access_token = tokens["access_token_enc"]
    refresh_token_value = tokens["refresh_token_enc"]
    
    # Check if token is expired
    expires_at = datetime.fromisoformat(tokens["expires_at"].replace("Z", "+00:00"))
    if expires_at < datetime.now(pytz.utc):
        access_token = await refresh_access_token(user_id, refresh_token_value)
        if not access_token:
            return {"error": "Token refresh failed"}

    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = await client.get(WORKOUTS_URL, headers=headers)

        if response.status_code == 200:
            data = response.json()
            workouts = data.get("workouts", data) 

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

def get_week_key(date_str):
    date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    return f"{date.year}-W{date.isocalendar().week:02d}"

async def sync_workouts_to_db(user_id: str):
    workouts = await get_workouts(user_id)
    if isinstance(workouts, dict) and "error" in workouts:
        return workouts
    
    synced_count = 0
    for w in workouts:
        workout_data = {
            "user_id": user_id,
            "provider": "wahoo",
            "provider_activity_id": str(w.get("id")),
            "sport": w.get("sport"),
            "start_dt": w.get("start_time"),
            "duration_s": w.get("duration"),
            "distance_m": w.get("distance"),
            "elevation_m": w.get("ascent"),
            "avg_hr": w.get("avg_heart_rate"),
            "avg_power": w.get("avg_power"),
            "metrics_json": w
        }
        # Upsert will handle deduplication based on unique constraint (user_id, provider, provider_activity_id)
        supabase.table("workouts").upsert(workout_data, on_conflict="user_id, provider, provider_activity_id").execute()
        synced_count += 1
    
    return {"status": "success", "synced": synced_count}
