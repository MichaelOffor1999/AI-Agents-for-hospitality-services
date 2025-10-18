from fastapi import FastAPI
from routes.restaurants import router as restaurant_router
from routes.orders import router as order_router
from routes.transcripts import router as transcript_router
from routes.voice import router as voice_router
from routes.bookings import router as bookings_router
from routes.dashboard import router as dashboard_router
import uvicorn
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Include routers
app.include_router(restaurant_router, prefix="/restaurants", tags=["restaurants"])
app.include_router(order_router, prefix="/orders", tags=["orders"])
app.include_router(transcript_router, prefix="/transcripts", tags=["transcripts"])
app.include_router(voice_router, prefix="/voice", tags=["voice"])
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
app.include_router(dashboard_router, prefix="", tags=["dashboard"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
