from pydantic import BaseModel, Field
from typing import List, Optional

class Order(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None
    restaurant_id: str
    items: List[dict]  = None # Example: [{"item": "Pizza", "qty": 2, "price": 12.99}]
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    timestamp: Optional[str] = None
    notes: Optional[str] = None
    receipt_path: Optional[str] = None
