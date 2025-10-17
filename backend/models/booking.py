from pydantic import BaseModel, Field
from typing import Optional

class Booking(BaseModel):
    restaurant_id: str = Field(..., description="ID of the restaurant")
    date: str = Field(..., description="Date of the booking (YYYY-MM-DD)")
    time: str = Field(..., description="Time of the booking (HH:MM)")
    party_size: int = Field(..., description="Number of people in the booking")
    customer_phone: Optional[str] = Field(None, description="Phone number of the customer")
    status: str = Field("confirmed", description="Booking status")
    id: Optional[str] = Field(None, description="Booking ID")
