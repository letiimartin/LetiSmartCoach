import os
from dotenv import load_dotenv
from openai import OpenAI
from supabase_client import get_supabase_client
from typing import List, Dict
import json

load_dotenv()

_openai_client = None

def get_openai_client():
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            print("⚠️ WARNING: DEEPSEEK_API_KEY missing. AI features will not work.")
            return None
        
        _openai_client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
    return _openai_client

supabase = get_supabase_client()

async def get_athlete_context(user_id: str):
    if not supabase:
        raise ValueError("Supabase client not initialized. Check your environment variables.")
        
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
    client = get_openai_client()
    if not client:
        raise ValueError("AI Client not initialized. Check your environment variables.")
        
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
    return plan_data

async def chat_with_coach(user_id: str, message: str, history: List[Dict]):
    client = get_openai_client()
    if not client:
        raise ValueError("AI Client not initialized. Check your environment variables.")
        
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
