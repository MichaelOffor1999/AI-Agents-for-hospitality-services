from fastapi import APIRouter, HTTPException
from models.booking import Booking
from utils.db import db
from typing import List

router = APIRouter()

@router.post("/bookings", response_model=Booking)
async def create_booking(booking: Booking):
    result = await db.bookings.insert_one(booking.dict(exclude={"id"}))
    booking.id = str(result.inserted_id)
    return booking

@router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking["id"] = str(booking["_id"])
    return Booking(**booking)

@router.get("/bookings", response_model=List[Booking])
async def list_bookings():
    bookings = []
    async for booking in db.bookings.find():
        booking["id"] = str(booking["_id"])
        bookings.append(Booking(**booking))
    return bookings

@router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str):
    result = await db.bookings.delete_one({"_id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}
