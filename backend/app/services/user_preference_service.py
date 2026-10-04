from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference
from app.repositories.user_preference_repository import (
    user_preference_repository,
)
from app.schemas.user_preference import PreferencesUpdate


class UserPreferenceService:
    def get_or_create_preferences(
        self,
        db: Session,
        user_id: UUID,
    ) -> UserPreference:
        preference = user_preference_repository.get_by_user_id(
            db=db,
            user_id=user_id,
        )

        if preference is not None:
            return preference

        preference = UserPreference(
            user_id=user_id,
        )

        preference = user_preference_repository.create(
            db=db,
            preference=preference,
        )

        db.commit()
        db.refresh(preference)

        return preference

    def update_preferences(
        self,
        db: Session,
        user_id: UUID,
        payload: PreferencesUpdate,
    ) -> UserPreference:
        preference = self.get_or_create_preferences(
            db=db,
            user_id=user_id,
        )

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
