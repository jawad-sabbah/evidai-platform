from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def get_by_id(
        self,
        db: Session,
        user_id: UUID,
    ) -> User | None:
        return db.get(User, user_id)
