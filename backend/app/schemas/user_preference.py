from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, StrictBool

from app.core.enums import AIResponseStyle, DefaultLandingPage, Theme


class PreferencesUpdate(BaseModel):
    theme: Theme | None = None
    timezone: str | None = None
    date_format: str | None = None
    default_landing_page: DefaultLandingPage | None = None


class PreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    theme: Theme
    timezone: str
    date_format: str
    default_landing_page: DefaultLandingPage
    created_at: datetime
    updated_at: datetime


class AIInvestigatorPreferencesUpdate(BaseModel):
    ai_response_style: AIResponseStyle | None = None
    ai_show_citations: StrictBool | None = None  ##Strict bool only acc true,false
    ai_show_confidence: StrictBool | None = None


class AIInvestigatorPreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    ai_response_style: AIResponseStyle
    ai_show_citations: bool
    ai_show_confidence: bool
    created_at: datetime
    updated_at: datetime
