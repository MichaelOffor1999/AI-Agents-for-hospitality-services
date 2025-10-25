from pydantic import BaseModel, Field
from typing import Optional, List

class MenuItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = Field(None, description="ID of the account (owner/staff) that manages this menu item")
    restaurant_id: str = Field(..., description="ID of the restaurant this item belongs to")
    name: str
    price: float
    category: Optional[str]
    description: Optional[str]
    available: bool = True
    image: Optional[str]
    prepTime: Optional[str]
    isPopular: Optional[bool]
    dietary: Optional[List[str]]
