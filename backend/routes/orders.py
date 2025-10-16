from fastapi import APIRouter, HTTPException
from models.order import Order
from utils.db import db
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find().to_list(100)
    return orders

@router.post("/", response_model=Order)
async def create_order(order: Order):
    result = await db.orders.insert_one(order.dict(by_alias=True))
    order.id = str(result.inserted_id)
    return order

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/{order_id}", response_model=Order)
async def update_order(order_id: str, order: Order):
    await db.orders.update_one({"_id": order_id}, {"$set": order.dict(by_alias=True)})
    order.id = order_id
    return order

@router.delete("/{order_id}")
async def delete_order(order_id: str):
    result = await db.orders.delete_one({"_id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Deleted"}
