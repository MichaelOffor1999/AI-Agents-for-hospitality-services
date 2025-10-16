from fastapi import FastAPI
from routes.restaurants import router as restaurant_router
from routes.orders import router as order_router
from routes.transcripts import router as transcript_router
import uvicorn

app = FastAPI()

# Include routers
app.include_router(restaurant_router, prefix="/restaurants", tags=["restaurants"])
app.include_router(order_router, prefix="/orders", tags=["orders"])
app.include_router(transcript_router, prefix="/transcripts", tags=["transcripts"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
