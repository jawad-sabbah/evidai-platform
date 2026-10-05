from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

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
