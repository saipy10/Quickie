from fastapi import APIRouter, HTTPException, Request, Response, Header
from pydantic import BaseModel
import google.generativeai as genai
import redis
import uuid
import json
from config import Config

router = APIRouter()

# Initialize Gemini AI
genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel(
    "gemini-2.0-flash",
    system_instruction="Keep answers as precise and clear as possible",
)

# Secure Redis connection
redis_client = redis.Redis(
    host=Config.REDIS_HOST,
    port=Config.REDIS_PORT,
    decode_responses=True,
    username=Config.REDIS_USERNAME,
    password=Config.REDIS_PASSWORD,
)

# Constants
SESSION_COOKIE_NAME = "chat_session"
SESSION_EXPIRY = 86400

class ChatRequest(BaseModel):
    prompt: str

def get_or_create_session(request: Request, response: Response, session_id: str = None):
    """Get or create a session, supporting both cookies & headers for Chrome extensions."""
    if not session_id:
        session_id = request.cookies.get(SESSION_COOKIE_NAME)

    if not session_id:
        session_id = str(uuid.uuid4())  # Generate new session ID
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            max_age=SESSION_EXPIRY,
            samesite="None",  # Required for cross-origin requests
            secure=True,  # Required for Chrome extensions
        )
        # print(f"🟢 New session created: {session_id}")
    else:
        # print(f"🔄 Existing session found: {session_id}")
        pass

    return session_id

@router.post("")
def chat(
    request: Request,
    response: Response,
    chat_request: ChatRequest,
    session_id: str = Header(None)  # Accept session ID from headers for extensions
):
    try:
        session_id = get_or_create_session(request, response, session_id)

        # Retrieve chat history from Redis
        chat_history_json = redis_client.get(session_id)
        chat_history = json.loads(chat_history_json) if chat_history_json else []

        # Format history for Gemini
        formatted_history = [
            {"role": entry["role"], "parts": [{"text": entry["text"]}]}
            for entry in chat_history
        ]

        # Start chat session with history
        chat_session_obj = model.start_chat(history=formatted_history)
        response_msg = chat_session_obj.send_message(chat_request.prompt)

        # Update chat history
        chat_history.append({"role": "user", "text": chat_request.prompt})
        chat_history.append({"role": "assistant", "text": response_msg.text})

        # Save chat history to Redis
        redis_client.setex(session_id, SESSION_EXPIRY, json.dumps(chat_history))

        return {"response": response_msg.text, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def chat_history(
    request: Request,
    session_id: str = Header(None)  # Accept session ID from headers
):
    """Retrieve chat history for the user's session."""
    try:
        session_id = session_id or request.cookies.get(SESSION_COOKIE_NAME)
        if not session_id:
            return {"message": "No chat history found."}

        chat_history_json = redis_client.get(session_id)
        if not chat_history_json:
            return {"message": "No chat history found."}

        return {"history": json.loads(chat_history_json)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
