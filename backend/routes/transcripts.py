from fastapi import APIRouter, HTTPException
from models.transcript import Transcript
from utils.db import db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Transcript])
async def get_transcripts(user_id: str = None):
    query = {}
    if user_id:
        query["user_id"] = user_id
    transcripts = await db.transcripts.find(query).to_list(100)
    return transcripts

@router.post("/", response_model=Transcript)
async def create_transcript(transcript: Transcript):
    result = await db.transcripts.insert_one(transcript.dict(by_alias=True))
    transcript.id = str(result.inserted_id)
    return transcript

@router.get("/{transcript_id}", response_model=Transcript)
async def get_transcript(transcript_id: str):
    transcript = await db.transcripts.find_one({"_id": transcript_id})
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return transcript

@router.delete("/{transcript_id}")
async def delete_transcript(transcript_id: str):
    result = await db.transcripts.delete_one({"_id": transcript_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {"message": "Deleted"}
