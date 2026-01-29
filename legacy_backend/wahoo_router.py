from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
import os

router = APIRouter(prefix="/auth/wahoo", tags=["wahoo"])

@router.get("/callback")
async def wahoo_callback(request: Request, state: str = None):
    """
    Render Callback: Only acts as a router. 
    It receives the code from Wahoo and redirects back to the App (Web or Mobile).
    Token exchange is handled exclusively inside the App via Supabase Edge Functions.
    """
    code = request.query_params.get("code")
    if not code:
        return JSONResponse(status_code=400, content={"error": "Missing authorization code"})

    # state indicates the platform: 'web' or 'mobile' (optionally with :nonce)
    # Use WEB_BASE_URL env var for ngrok / web dev redirect
    web_base_url = os.getenv("WEB_BASE_URL", "https://187525c767f3.ngrok-free.app")
    
    if state and state.startswith("web"):
        # In web, we redirect to the app's callback route on the provided web base
        redirect_to = f"{web_base_url}/wahoo-callback?code={code}"
    else:
        # In mobile, we use the custom scheme to open the app
        redirect_to = f"letismartcoach://wahoo-callback?code={code}"

    print(f"► Wahoo Router: Redirecting to {redirect_to}")
    return RedirectResponse(url=redirect_to)

# Endpoints /sync and /workouts removed from Render to centralize logic in Supabase.
