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
    # state indicates the platform: 'web' or 'mobile'
    code = request.query_params.get("code")
    if not code:
        return JSONResponse(status_code=400, content={"error": "Missing authorization code"})

    # Determine base redirect URL based on state
    if state == "web":
        # In web (ngrok), we redirect to the app's callback route
        # Using the base ngrok URL provided in the request
        base_url = "https://187525c767f3.ngrok-free.app"
        redirect_to = f"{base_url}/wahoo-callback?code={code}"
    else:
        # In mobile, we use the custom scheme
        redirect_to = f"letismartcoach://wahoo-callback?code={code}"

    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=redirect_to)

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
