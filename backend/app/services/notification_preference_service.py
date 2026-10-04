from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification_preference import NotificationPreference
from app.repositories.notification_preference_repository import (
    notification_preference_repository,
)
from app.schemas.notification_preference import NotificationPreferenceUpdate


class NotificationPreferenceService:
    def get_preferences(
        self,
        db: Session,
        user_id: UUID,
    ) -> NotificationPreference | None:
        return notification_preference_repository.get_by_user_id(
            db=db,
            user_id=user_id,
        )

    def update_preferences(
        self,
        db: Session,
        user_id: UUID,
        payload: NotificationPreferenceUpdate,
    ) -> NotificationPreference | None:
        preference = notification_preference_repository.get_by_user_id(
            db=db,
            user_id=user_id,
        )

        if preference is None:
            return None

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(preference, field, value)

        notification_preference_repository.update(
            db=db,
            preference=preference,
        )

        db.commit()
        db.refresh(preference)

        return preference


notification_preference_service = NotificationPreferenceService()
