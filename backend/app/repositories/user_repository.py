from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def get_by_id(
        self,
        db: Session,
        user_id: UUID,
    ) -> User | None:
        return db.get(User, user_id)

    def get_by_email(
        self,
        db: Session,
        email: str,
    ) -> User | None:
        statement = select(User).where(User.email == email)

        return db.scalar(statement)

    def create_user(self, db: Session, user: User) -> User:
        (db.add(user),)
        db.flush()
        return user
