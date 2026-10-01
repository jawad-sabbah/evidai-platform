from sqlalchemy.orm import Session

from app.core.exceptions import EmailAlreadyExistsError
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserCreate


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
    ) -> None:
        self.user_repository = user_repository

    def register(
        self,
        db: Session,
        payload: UserCreate,
    ) -> User:
        existing_user = self.user_repository.get_by_email(
            db,
            payload.email,
        )

        if existing_user is not None:
            raise EmailAlreadyExistsError("Email already registered")

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )

        try:
            self.user_repository.create_user(
                db,
                user,
            )

            db.commit()
            db.refresh(user)

            return user

        except Exception:
            db.rollback()
            raise


auth_service = AuthService(
    user_repository=UserRepository(),
)
