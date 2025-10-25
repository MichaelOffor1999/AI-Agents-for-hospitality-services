from fastapi import APIRouter, HTTPException, Depends
from models.menu_item import MenuItem
from utils.db import db
from routes.users import get_current_user
from typing import List

router = APIRouter()

@router.get("/", response_model=List[MenuItem])
async def get_menu_items(current_user: dict = Depends(get_current_user)):
    items = await db.menu_items.find({
        "user_id": str(current_user["_id"]),
        "restaurant_id": {"$in": await get_user_restaurant_ids(current_user)}
    }).to_list(100)
    return items

@router.post("/", response_model=MenuItem)
async def create_menu_item(item: MenuItem, current_user: dict = Depends(get_current_user)):
    # Only allow creation for user's restaurants
    if not await user_owns_restaurant(item.restaurant_id, current_user):
        raise HTTPException(status_code=403, detail="Not authorized for this restaurant")
    item.user_id = str(current_user["_id"])
    result = await db.menu_items.insert_one(item.dict(exclude={"id"}, by_alias=True))
    item.id = str(result.inserted_id)
    return item

@router.get("/{item_id}", response_model=MenuItem)
async def get_menu_item(item_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.menu_items.find_one({"_id": item_id, "user_id": str(current_user["_id"])})
    if not item or not await user_owns_restaurant(item["restaurant_id"], current_user):
        raise HTTPException(status_code=404, detail="Menu item not found")
    return MenuItem(**item)

@router.put("/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item: MenuItem, current_user: dict = Depends(get_current_user)):
    existing = await db.menu_items.find_one({"_id": item_id, "user_id": str(current_user["_id"])})
    if not existing or not await user_owns_restaurant(existing["restaurant_id"], current_user):
        raise HTTPException(status_code=404, detail="Menu item not found")
    item.user_id = str(current_user["_id"])
    await db.menu_items.update_one({"_id": item_id}, {"$set": item.dict(by_alias=True)})
    item.id = item_id
    return item

@router.delete("/{item_id}")
async def delete_menu_item(item_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.menu_items.find_one({"_id": item_id, "user_id": str(current_user["_id"])})
    if not item or not await user_owns_restaurant(item["restaurant_id"], current_user):
        raise HTTPException(status_code=404, detail="Menu item not found")
    result = await db.menu_items.delete_one({"_id": item_id, "user_id": str(current_user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Deleted"}

# Helper functions
async def get_user_restaurant_ids(current_user):
    cursor = db.restaurants.find({"user_id": str(current_user["_id"])})
    return [str(r["_id"]) async for r in cursor]

async def user_owns_restaurant(restaurant_id, current_user):
    restaurant = await db.restaurants.find_one({"_id": restaurant_id, "user_id": str(current_user["_id"])})
    return restaurant is not None
