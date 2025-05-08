from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
from wahoo_api import get_workouts

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
        return {
            "access_token": token_data["access_token"],
            "refresh_token": token_data["refresh_token"],
            "expires_in": token_data["expires_in"]
        }
    else:
        return JSONResponse(status_code=500, content={"error": "Error al obtener token", "details": response.text})

@app.get("/workouts")
async def workouts():
    return await get_workouts()

