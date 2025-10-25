from fastapi import APIRouter, HTTPException, Depends
from models.restaurant import Restaurant
from utils.db import db
from typing import List

from routes.users import get_current_user

router = APIRouter()


@router.get("/", response_model=List[Restaurant])
async def get_restaurants(current_user: dict = Depends(get_current_user)):
    restaurants = []
    async for restaurant in db.restaurants.find({"user_id": str(current_user["_id"]) }):
        restaurant["id"] = str(restaurant["_id"])
        if restaurant.pop("_id", None):
            pass
        restaurants.append(Restaurant(**restaurant))
    return restaurants


@router.post("/", response_model=Restaurant)
async def create_restaurant(restaurant: Restaurant, current_user: dict = Depends(get_current_user)):
    restaurant.user_id = str(current_user["_id"])
    result = await db.restaurants.insert_one(restaurant.dict(exclude={"id"}, by_alias=True))
    restaurant.id = str(result.inserted_id)
    return restaurant


@router.get("/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    restaurant = await db.restaurants.find_one({"_id": restaurant_id, "user_id": str(current_user["_id"])})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    restaurant["id"] = str(restaurant["_id"])
    restaurant.pop("_id", None)
    return Restaurant(**restaurant)


@router.put("/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(restaurant_id: str, restaurant: Restaurant, current_user: dict = Depends(get_current_user)):
    # Only allow update if the restaurant belongs to the user
    existing = await db.restaurants.find_one({"_id": restaurant_id, "user_id": str(current_user["_id"])})
    if not existing:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    await db.restaurants.update_one({"_id": restaurant_id}, {"$set": restaurant.dict(by_alias=True)})
    restaurant.id = restaurant_id
    return restaurant


@router.delete("/{restaurant_id}")
async def delete_restaurant(restaurant_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.restaurants.delete_one({"_id": restaurant_id, "user_id": str(current_user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Deleted"}
