from fastapi import APIRouter, Depends, HTTPException
from supabase_client import get_supabase_client
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/athlete", tags=["athlete"])
supabase = get_supabase_client()

class AthleteProfile(BaseModel):
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    sport_focus: Optional[str] = None
    ftp_w: Optional[int] = None
    vo2max: Optional[float] = None
    zones_power_json: Optional[dict] = None
    zones_hr_json: Optional[dict] = None
    settings: Optional[dict] = None

@router.get("/profile")
async def get_profile(user_id: str):
    # In a real app, user_id would come from auth token
    response = supabase.table("athlete_profile").select("*").eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data[0]

@router.post("/profile")
async def update_profile(user_id: str, profile: AthleteProfile):
    data = profile.dict(exclude_unset=True)
    response = supabase.table("athlete_profile").upsert({"user_id": user_id, **data}).execute()
    return response.data[0]
