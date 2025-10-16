from pydantic import BaseModel, Field
from typing import List, Optional

class Order(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    restaurant_id: str
    items: List[dict]  # Example: [{"item": "Pizza", "qty": 2, "price": 12.99}]
    customer_name: Optional[str]
    customer_phone: Optional[str]
    timestamp: Optional[str]
    notes: Optional[str]
    receipt_path: Optional[str]
