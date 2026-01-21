from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from supabase_client import get_supabase_client
import json

router = APIRouter(prefix="/sessions", tags=["sessions"])
supabase = get_supabase_client()

@router.get("/{session_id}")
async def get_session(user_id: str, session_id: str):
    response = supabase.table("planned_sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return response.data[0]

@router.get("/{session_id}/export")
async def export_session(user_id: str, session_id: str, format: str = "json"):
    response = supabase.table("planned_sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = response.data[0]
    
    if format == "json":
        # Return the structured JSON for Wahoo/other devices
        return session["structure_json"]
    
    # Placeholder for FIT format
    raise HTTPException(status_code=400, detail="Format not supported yet. Use 'json'.")
