from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field



class UserCreate(BaseModel):
  full_name: str = Field(min_length=1, max_length=150)
  email: EmailStr
  password: str = Field(min_length=8)


