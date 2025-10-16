from pydantic import BaseModel, Field
from typing import List, Optional

class Restaurant(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    menu: List[dict]  # Example: [{"item": "Pizza", "price": 12.99}]
    hours: dict       # Example: {"mon": "9-5", "tue": "9-5"}
    phone: Optional[str]
    address: Optional[str]
