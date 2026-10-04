from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationPreferenceUpdate(BaseModel):
    evidence_failed: bool | None = None
    evidence_ready: bool | None = None
    review_assigned: bool | None = None
    finding_verified: bool | None = None
    report_ready: bool | None = None
    mentions: bool | None = None
    email_notifications: bool | None = None
    in_app_notifications: bool | None = None


class NotificationPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID

    evidence_failed: bool
    evidence_ready: bool
    review_assigned: bool
    finding_verified: bool
    report_ready: bool
    mentions: bool
    email_notifications: bool
    in_app_notifications: bool

    created_at: datetime
    updated_at: datetime
