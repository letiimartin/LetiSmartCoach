import os
from openai import OpenAI
from supabase_client import get_supabase_client
from typing import List, Dict
import json

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com" # DeepSeek API base URL
)

supabase = get_supabase_client()

async def get_athlete_context(user_id: str):
    # Fetch profile, recent workouts, and calendar events
    profile = supabase.table("athlete_profile").select("*").eq("user_id", user_id).execute().data
    workouts = supabase.table("workouts").select("*").eq("user_id", user_id).order("start_dt", desc=True).limit(10).execute().data
    events = supabase.table("calendar_events").select("*").eq("user_id", user_id).order("start_dt").execute().data
    
    return {
        "profile": profile[0] if profile else {},
        "recent_workouts": workouts,
        "upcoming_events": events
    }

async def generate_weekly_plan(user_id: str):
    context = await get_athlete_context(user_id)
    
    prompt = f"""
    You are LetiSmartCoach, an expert AI coach for cycling and trail running.
    Based on the following athlete data, generate a weekly training plan (7 days).
    
    Athlete Profile: {json.dumps(context['profile'])}
    Recent Workouts: {json.dumps(context['recent_workouts'])}
    Upcoming Events: {json.dumps(context['upcoming_events'])}
    
    Guidelines:
    - Respect the athlete's zones and FTP.
    - Adjust load based on recent workouts.
    - If there's an upcoming race, prioritize tapering or specific prep.
    - Provide each session with a title, sport, structure (warmup, intervals, cooldown), targets (Z2, 95% FTP, etc.), and a brief explanation ('why').
    - Return the result in a valid JSON format as specified in the SRS.
    """
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a professional sports coach. Always respond in JSON format."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    plan_data = json.loads(response.choices[0].message.content)
    # Save the plan to DB
    # ... logic to save to training_plans and planned_sessions ...
    return plan_data

async def chat_with_coach(user_id: str, message: str, history: List[Dict]):
    context = await get_athlete_context(user_id)
    
    messages = [
        {"role": "system", "content": "You are LetiSmartCoach. Use the athlete's context to provide personalized advice."},
    ]
    for h in history:
        messages.append(h)
    messages.append({"role": "user", "content": f"Context: {json.dumps(context)}\n\nUser: {message}"})
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages
    )
    
    return response.choices[0].message.content
