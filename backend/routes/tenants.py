from fastapi import APIRouter, HTTPException, Depends
from models.restaurant import Restaurant
from utils.db import db
from typing import Optional
from routes.users import get_current_user

router = APIRouter()

@router.get("/tenants/{tenant_id}", response_model=Restaurant)
async def get_tenant(tenant_id: str, current_user: dict = Depends(get_current_user)):
    # tenant_id is actually the user_id from login, so look up restaurant by user_id field
    print(f"[DEBUG] Looking for restaurant with user_id: {tenant_id}")
    print(f"[DEBUG] Authenticated user: {current_user.get('_id')}")
    restaurant = await db.restaurants.find_one({"user_id": tenant_id})
    print(f"[DEBUG] Found restaurant: {restaurant}")
    if not restaurant:
        print("[DEBUG] No restaurant found for this user_id")
        raise HTTPException(status_code=404, detail="Tenant (restaurant) not found")
    print("[DEBUG] Returning restaurant data")
    return Restaurant(**restaurant)
