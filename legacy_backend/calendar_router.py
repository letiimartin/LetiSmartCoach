from fastapi import APIRouter, HTTPException
from supabase_client import get_supabase_client
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/calendar", tags=["calendar"])
supabase = get_supabase_client()

class CalendarEvent(BaseModel):
    type: str # race, social, health, personal
    title: str
    start_dt: datetime
    end_dt: Optional[datetime] = None
    details_json: Optional[dict] = {}
    priority: Optional[str] = None # A, B, C
    constraints_json: Optional[dict] = {}

@router.get("/events")
async def get_events(user_id: str):
    response = supabase.table("calendar_events").select("*").eq("user_id", user_id).execute()
    return response.data

@router.post("/events")
async def create_event(user_id: str, event: CalendarEvent):
    data = event.dict()
    data["user_id"] = user_id
    response = supabase.table("calendar_events").insert(data).execute()
    return response.data[0]

@router.delete("/events/{event_id}")
async def delete_event(user_id: str, event_id: str):
    response = supabase.table("calendar_events").delete().eq("id", event_id).eq("user_id", user_id).execute()
    return {"status": "deleted"}
