from fastapi import FastAPI
from routes.restaurants import router as restaurant_router
from routes.orders import router as order_router
from routes.transcripts import router as transcript_router
from routes.voice import router as voice_router
from routes.bookings import router as bookings_router
from routes.dashboard import router as dashboard_router
from routes.users import router as user_router
from routes.menu_items import router as menu_items_router
from routes.tenants import router as tenants_router
import uvicorn
import openai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# CORS setup (allow all origins for dev; restrict in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(restaurant_router, prefix="/api/v1/restaurants", tags=["restaurants"])
app.include_router(order_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(transcript_router, prefix="/api/v1/transcripts", tags=["transcripts"])
app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(bookings_router, prefix="/api/v1/bookings", tags=["bookings"])
app.include_router(dashboard_router, prefix="/api/v1", tags=["dashboard"])
app.include_router(user_router, prefix="/api/v1", tags=["users"])
app.include_router(menu_items_router, prefix="/api/v1/menu_items", tags=["menu_items"])
app.include_router(tenants_router, prefix="/api/v1", tags=["tenants"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
