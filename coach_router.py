from fastapi import APIRouter, HTTPException
from coach_service import generate_weekly_plan, chat_with_coach
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/coach", tags=["coach"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@router.post("/generate-plan")
async def create_plan(user_id: str):
    try:
        plan = await generate_weekly_plan(user_id)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(user_id: str, request: ChatRequest):
    try:
        response = await chat_with_coach(user_id, request.message, request.history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
