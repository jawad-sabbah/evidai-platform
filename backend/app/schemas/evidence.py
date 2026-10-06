from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.enums import EvidenceProcessingStatus


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    case_id: UUID
    uploaded_by: UUID

    original_filename: str
    display_name: str | None

    file_type: str
    mime_type: str | None
    file_size: int | None

    storage_key: str
    checksum: str | None

    source_type: str | None
    description: str | None

    processing_status: EvidenceProcessingStatus

    created_at: datetime
    updated_at: datetime


class EvidenceMetadataUpdate(BaseModel):
    display_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )
    description: str | None = None
    source_type: str | None = None

    @model_validator(mode="after")
    def validate_at_least_one_field(self) -> "EvidenceMetadataUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one metadata field must be provided")

        return self
