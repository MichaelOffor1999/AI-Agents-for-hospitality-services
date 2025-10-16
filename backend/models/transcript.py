from pydantic import BaseModel, Field
from typing import Optional

class Transcript(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    restaurant_id: str
    order_id: Optional[str]
    user_id: Optional[str]  # Link transcript to individual user/customer
    call_text: str
    timestamp: Optional[str]
