from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository


class ProfileService:
    def __init__(
        self,
        user_repository: UserRepository,
    ) -> None:
        self.user_repository = user_repository

    def get_current_user_profile(
        self,
        db: Session,
        user_id: UUID,
    ) -> User | None:
        return self.user_repository.get_by_id(
            db=db,
            user_id=user_id,
        )


profile_service = ProfileService(
    user_repository=UserRepository(),
)
