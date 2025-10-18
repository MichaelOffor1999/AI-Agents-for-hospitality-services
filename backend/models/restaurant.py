from pydantic import BaseModel, Field
from typing import List, Optional

class MenuItem(BaseModel):
    id: Optional[str]
    name: str
    price: float
    category: str
    description: Optional[str]
    available: bool
    image: Optional[str]
    prepTime: Optional[str]
    isPopular: Optional[bool]
    dietary: Optional[List[str]]

class Restaurant(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    menu: List[MenuItem]
    hours: dict       # Example: {"mon": "9-5", "tue": "9-5"}
    phone: Optional[str]
    address: Optional[str]
