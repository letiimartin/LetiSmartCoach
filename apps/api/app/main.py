# apps/api/app/main.py
import os
from fastapi import FastAPI, Request, HTTPException

app = FastAPI(title="LetiSmartCoach API", version="0.1.0")

STRAVA_VERIFY_TOKEN = os.getenv("STRAVA_VERIFY_TOKEN", "test_token")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/webhooks/strava")
async def verify_strava_webhook(request: Request):
    qp = request.query_params
    mode = qp.get("hub.mode", "")
    verify_token = qp.get("hub.verify_token", "")
    challenge = qp.get("hub.challenge", "")

    print("DEBUG mode=", repr(mode),
          "recv_token=", repr(verify_token),
          "expected_token=", repr(STRAVA_VERIFY_TOKEN))

    if mode == "subscribe" and verify_token == STRAVA_VERIFY_TOKEN:
        return {"hub.challenge": challenge}

    raise HTTPException(status_code=403, detail="Invalid verify token")

@app.post("/webhooks/strava")
async def strava_event(request: Request):
    payload = await request.json()
    print("DEBUG STRAVA EVENT:", payload)
    return {"received": True}
