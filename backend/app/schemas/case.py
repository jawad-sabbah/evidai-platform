from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

## Schemas define shape of data enter and leave APi 


## when create case the shape of case that created should have {title,description,case_type}
class CaseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    case_type: str = Field(default="OTHER", max_length=50)


class CaseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    case_type: str | None = Field(default=None, max_length=50)
    status: str | None = Field(default=None, max_length=30)


class CaseResponse(BaseModel):
    
    #Pydantic turn a SQLAlchemy Case object into a response model.
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_number: str
    title: str
    description: str | None
    case_type: str
    status: str
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None