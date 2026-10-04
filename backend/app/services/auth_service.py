from sqlalchemy.orm import Session

from app.core.exceptions import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    InvalidCurrentPasswordError,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, UserCreate


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

    def login(
        self,
        db: Session,
        payload: LoginRequest,
    ) -> str:
        user = self.user_repository.get_by_email(
            db,
            payload.email,
        )

        if user is None:
            raise InvalidCredentialsError("Invalid email or password")

        if not verify_password(
            payload.password,
            user.password_hash,
        ):
            raise InvalidCredentialsError("Invalid email or password")

        if user.status != "ACTIVE":
            raise InvalidCredentialsError("User account is disabled")

        return create_access_token(user.id)

    def change_password(
        self,
        db: Session,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:
        if not verify_password(
            current_password,
            user.password_hash,
        ):
            raise InvalidCurrentPasswordError("Current password is incorrect")

        user.password_hash = hash_password(new_password)

        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            raise


auth_service = AuthService(
    user_repository=UserRepository(),
)
