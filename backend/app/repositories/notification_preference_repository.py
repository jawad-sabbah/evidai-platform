from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.notification_preference import NotificationPreference


class NotificationPreferenceRepository:
    def get_by_user_id(
        self,
        db: Session,
        user_id: UUID,
    ) -> NotificationPreference | None:
        statement = select(NotificationPreference).where(
            NotificationPreference.user_id == user_id
        )

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        preference: NotificationPreference,
    ) -> NotificationPreference:
        db.add(preference)
        db.flush()

        return preference

    def update(
        self,
        db: Session,
        preference: NotificationPreference,
    ) -> NotificationPreference:
        db.flush()
        return preference


notification_preference_repository = NotificationPreferenceRepository()
