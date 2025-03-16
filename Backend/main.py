import os
from fastapi import FastAPI
from chat import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

EXTENSION_ID = os.getenv("EXTENSION_ID")

print(EXTENSION_ID)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"chrome-extension://{EXTENSION_ID}",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat_router, prefix="/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {"message": "Hello World"}
