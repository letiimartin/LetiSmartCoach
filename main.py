from fastapi import FastAPI, Request, APIRouter
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
from wahoo_api import get_workouts, get_workouts_weekly_load
from auth_utils import save_tokens, load_tokens

load_dotenv()  

app = FastAPI()

CLIENT_ID = os.getenv("WAHOO_CLIENT_ID")
CLIENT_SECRET = os.getenv("WAHOO_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
TOKEN_URL = "https://api.wahooligan.com/oauth/token"

@app.get("/")
def root():
    return {"message": "Servidor funcionando ✅"}

@app.get("/auth/wahoo/callback") 
async def wahoo_callback(request: Request):
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
        save_tokens(token_data)
        return JSONResponse(status_code=200, content={"message": "Token guardado exitosamente"})
    else:
        return JSONResponse(status_code=500, content={"error": "Error al obtener token", "details": response.text})

@app.get("/workouts")
async def read_workouts(
    activity_type: str = Query(None),
    min_date: str = Query(None),       # formato ISO: "2024-01-01T00:00:00Z"
    min_duration: int = Query(None)    # en minutos
):
    return await get_workouts(activity_type, min_date, min_duration)


@app.get("/weekly-load")
async def weekly_load():
    return await get_workouts_weekly_load()

