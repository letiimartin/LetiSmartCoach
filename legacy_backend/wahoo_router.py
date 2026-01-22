from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx
import os
from wahoo_api import save_user_tokens, sync_workouts_to_db, get_workouts
from supabase_client import get_supabase_client

router = APIRouter(prefix="/wahoo", tags=["wahoo"])

CLIENT_ID = os.getenv("WAHOO_CLIENT_ID")
CLIENT_SECRET = os.getenv("WAHOO_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
TOKEN_URL = "https://api.wahooligan.com/oauth/token"

@router.get("/callback")
async def wahoo_callback(request: Request, state: str = None):
    # state should contain the user_id (sent during the authorize redirect)
    user_id = state 
    if not user_id:
        return JSONResponse(status_code=400, content={"error": "Missing user state (user_id)"})

    code = request.query_params.get("code")
    if not code:
        return JSONResponse(status_code=400, content={"error": "Missing authorization code"})

    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI
        })

    if response.status_code == 200:
        token_data = response.json()
        await save_user_tokens(user_id, token_data)
        # Automatically sync initial workouts
        await sync_workouts_to_db(user_id)
        return {"message": "Wahoo connection successful and initial sync completed"}
    else:
        return JSONResponse(status_code=500, content={"error": "Error obtaining Wahoo token", "details": response.text})

@router.get("/sync")
async def sync_workouts(user_id: str):
    return await sync_workouts_to_db(user_id)

@router.get("/workouts")
async def list_workouts(user_id: str):
    # This could also fetch from DB instead of API directly
    from supabase_client import get_supabase_client
    supabase = get_supabase_client()
    response = supabase.table("workouts").select("*").eq("user_id", user_id).order("start_dt", desc=True).execute()
    return response.data
