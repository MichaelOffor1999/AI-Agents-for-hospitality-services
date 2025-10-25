from fastapi import APIRouter, HTTPException, Depends
from models.booking import Booking
from utils.db import db
from typing import List

from routes.users import get_current_user

router = APIRouter()


@router.post("/bookings", response_model=Booking)
async def create_booking(booking: Booking, current_user: dict = Depends(get_current_user)):
    # Verify restaurant belongs to user
    restaurant = await db.restaurants.find_one({"_id": booking.restaurant_id, "user_id": str(current_user["_id"])})
    if not restaurant:
        raise HTTPException(status_code=403, detail="Not authorized for this restaurant")
    booking.user_id = str(current_user["_id"])
    result = await db.bookings.insert_one(booking.dict(exclude={"id"}))
    booking.id = str(result.inserted_id)
    return booking


@router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, restaurant_id: str, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"_id": booking_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking["id"] = str(booking["_id"])
    return Booking(**booking)


@router.get("/bookings", response_model=List[Booking])
async def list_bookings(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    bookings = []
    async for booking in db.bookings.find({"user_id": str(current_user["_id"]), "restaurant_id": restaurant_id}):
        booking["id"] = str(booking["_id"])
        bookings.append(Booking(**booking))
    return bookings


@router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, restaurant_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.bookings.delete_one({"_id": booking_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}
