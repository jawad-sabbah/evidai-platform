from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from app.core.enums import SystemRole


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    system_role: SystemRole
    status: str
