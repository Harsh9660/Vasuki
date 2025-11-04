from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os
from .agent import generate_response

load_dotenv()

app = FastAPI(title="Vasuki AI Agent Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Vasuki backend running"}

@app.post("/chat")
async def chat_endpoint(payload: dict):
    message = payload.get("message")
    history = payload.get("history", [])
    stream = payload.get("stream", True) # Default to streaming
    if not message:
        raise HTTPException(status_code=400, detail="`message` field required")

    if stream:
        response_generator = await generate_response(message, history, stream=True)
        return StreamingResponse(response_generator, media_type="text/event-stream")
    else:
        resp = await generate_response(message, history, stream=False)
        return {"reply": resp["text"]}
