from pydantic import BaseModel, Field
from typing import Optional

class Restaurant(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = Field(None, description="ID of the account (owner/staff) that manages this restaurant")
    name: str
    hours: dict       # Example: {"mon": "9-5", "tue": "9-5"}
    phone: Optional[str]
    address: Optional[str]
