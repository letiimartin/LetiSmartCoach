from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from athlete_router import router as athlete_router
from calendar_router import router as calendar_router
from wahoo_router import router as wahoo_router
from coach_router import router as coach_router
from session_router import router as session_router

load_dotenv()

app = FastAPI(title="LetiSmartCoach API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "LetiSmartCoach API is running ✅"}

app.include_router(athlete_router)
app.include_router(calendar_router)
app.include_router(wahoo_router)
app.include_router(coach_router)
app.include_router(session_router)

