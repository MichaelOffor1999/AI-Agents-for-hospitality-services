from fastapi import APIRouter, HTTPException, Depends, Query
from models.order import Order
from utils.db import db
from typing import List
from routes.users import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Order])
async def get_orders(
    restaurant_id: str = Query(..., description="ID of the restaurant for orders"),
    current_user: dict = Depends(get_current_user)
):
    # Verify restaurant belongs to user
    restaurant = await db.restaurants.find_one({"_id": restaurant_id, "user_id": str(current_user["_id"])})
    if not restaurant:
        raise HTTPException(status_code=403, detail="Not authorized for this restaurant")
    orders = await db.orders.find({"user_id": str(current_user["_id"]), "restaurant_id": restaurant_id}).to_list(100)
    return orders

@router.post("/", response_model=Order)
async def create_order(order: Order, current_user: dict = Depends(get_current_user)):
    # Verify restaurant belongs to user
    restaurant = await db.restaurants.find_one({"_id": order.restaurant_id, "user_id": str(current_user["_id"])})
    if not restaurant:
        raise HTTPException(status_code=403, detail="Not authorized for this restaurant")
    order.user_id = str(current_user["_id"])
    result = await db.orders.insert_one(order.dict(by_alias=True))
    order.id = str(result.inserted_id)
    return order

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str, restaurant_id: str = Query(...), current_user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"_id": order_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=Order)
async def update_order(order_id: str, order: Order, restaurant_id: str = Query(...), current_user: dict = Depends(get_current_user)):
    # Only allow update if the order belongs to the user and restaurant
    existing = await db.orders.find_one({"_id": order_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one({"_id": order_id}, {"$set": order.dict(by_alias=True)})
    order.id = order_id
    return order

@router.delete("/{order_id}")
async def delete_order(order_id: str, restaurant_id: str = Query(...), current_user: dict = Depends(get_current_user)):
    # Only allow delete if the order belongs to the user and restaurant
    result = await db.orders.delete_one({"_id": order_id, "user_id": str(current_user["_id"]), "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Deleted"}
