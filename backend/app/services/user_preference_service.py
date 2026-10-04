from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference
from app.repositories.user_preference_repository import (
    user_preference_repository,
)
from app.schemas.user_preference import PreferencesUpdate


class UserPreferenceService:
    def get_preferences(
        self,
        db: Session,
        user_id: UUID,
    ) -> UserPreference | None:
        return user_preference_repository.get_by_user_id(
            db=db,
            user_id=user_id,
        )

    def update_preferences(
        self,
        db: Session,
        user_id: UUID,
        payload: PreferencesUpdate,
    ) -> UserPreference | None:
        preference = user_preference_repository.get_by_user_id(
            db=db,
            user_id=user_id,
        )

        if preference is None:
            return None

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(preference, field, value)

        preference = user_preference_repository.update(
            db=db,
            preference=preference,
        )

        db.commit()
        db.refresh(preference)

        return preference


user_preference_service = UserPreferenceService()
