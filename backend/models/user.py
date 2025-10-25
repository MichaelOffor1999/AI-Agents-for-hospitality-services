from pydantic import BaseModel, Field
from typing import Optional

class User(BaseModel):
	id: Optional[str] = Field(None, alias="_id")
	name: Optional[str] = None
	email: str
	password_hash: str
	phone: Optional[str] = None
	created_at: Optional[str] = None
