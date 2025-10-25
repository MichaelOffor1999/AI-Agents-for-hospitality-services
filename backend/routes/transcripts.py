from fastapi import APIRouter, HTTPException, Depends
from models.transcript import Transcript
from utils.db import db
from typing import List

from routes.users import get_current_user

router = APIRouter()


@router.get("/", response_model=List[Transcript])
async def get_transcripts(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    transcripts = await db.transcripts.find({"user_id": str(current_user["_id"]), "restaurant_id": restaurant_id }).to_list(100)
    return transcripts


@router.post("/", response_model=Transcript)
async def create_transcript(transcript: Transcript, current_user: dict = Depends(get_current_user)):
    # Verify restaurant belongs to user
    restaurant = await db.restaurants.find_one({"_id": transcript.restaurant_id, "user_id": str(current_user["_id"])})
    if not restaurant:
        raise HTTPException(status_code=403, detail="Not authorized for this restaurant")
    transcript.user_id = str(current_user["_id"])
    result = await db.transcripts.insert_one(transcript.dict(by_alias=True))
    transcript.id = str(result.inserted_id)
    return transcript


@router.get("/{transcript_id}", response_model=Transcript)
async def get_transcript(transcript_id: str, restaurant_id: str, current_user: dict = Depends(get_current_user)):
    transcript = await db.transcripts.find_one({"_id": transcript_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return transcript



@router.delete("/{transcript_id}")
async def delete_transcript(transcript_id: str, restaurant_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.transcripts.delete_one({"_id": transcript_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {"message": "Deleted"}
