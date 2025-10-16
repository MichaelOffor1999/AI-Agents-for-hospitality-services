from fastapi import APIRouter, HTTPException
from models.restaurant import Restaurant
from utils.db import db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Restaurant])
async def get_restaurants():
    restaurants = await db.restaurants.find().to_list(100)
    return restaurants

@router.post("/", response_model=Restaurant)
async def create_restaurant(restaurant: Restaurant):
    result = await db.restaurants.insert_one(restaurant.dict(by_alias=True))
    restaurant.id = str(result.inserted_id)
    return restaurant

@router.get("/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(restaurant_id: str):
    restaurant = await db.restaurants.find_one({"_id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.put("/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(restaurant_id: str, restaurant: Restaurant):
    await db.restaurants.update_one({"_id": restaurant_id}, {"$set": restaurant.dict(by_alias=True)})
    restaurant.id = restaurant_id
    return restaurant

@router.delete("/{restaurant_id}")
async def delete_restaurant(restaurant_id: str):
    result = await db.restaurants.delete_one({"_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {"message": "Deleted"}
