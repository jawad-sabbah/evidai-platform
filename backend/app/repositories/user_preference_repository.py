from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference


class UserPreferenceRepository:
    def get_by_user_id(
        self,
        db: Session,
        user_id: UUID,
    ) -> UserPreference | None:
        statement = select(UserPreference).where(UserPreference.user_id == user_id)

        return db.scalar(statement)

    def create(
        self,
        db: Session,
        preference: UserPreference,
    ) -> UserPreference:
        db.add(preference)
        db.flush()

        return preference

    def update(
        self,
        db: Session,
        preference: UserPreference,
    ) -> UserPreference:
        db.flush()
        db.refresh(preference)

        return preference


user_preference_repository = UserPreferenceRepository()
