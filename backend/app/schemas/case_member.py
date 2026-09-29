from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.core.enums import CaseRole


class CaseMemberCreate(BaseModel):
    user_id: UUID
    case_role: CaseRole


class CaseMemberUpdate(BaseModel):
    case_role: CaseRole


class CaseMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_id: UUID
    user_id: UUID
    case_role: CaseRole
    created_at: datetime
