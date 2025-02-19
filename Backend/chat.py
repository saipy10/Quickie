from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from config import Config

router = APIRouter()

# Initialize Gemini client
genai.configure(api_key=Config.GEMINI_API_KEY)
model = genai.GenerativeModel(
    "gemini-2.0-flash",  # Fixed model name
    system_instruction="Keep answers as precise and clear as possible",
)
chat_session = model.start_chat()

# Store chat history manually
chat_history_list = []


# Define request model
class ChatRequest(BaseModel):
    prompt: str


@router.post("")
def chat(request: ChatRequest):
    try:
        response = chat_session.send_message(request.prompt)

        # Store message and response manually
        chat_history_list.append({"role": "user", "text": request.prompt})
        chat_history_list.append({"role": "assistant", "text": response.text})

        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def chat_history():
    try:
        return {"history": chat_history_list}  # Return manually stored history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
