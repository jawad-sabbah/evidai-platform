from sqlalchemy.orm import Session

from app.core.exceptions import EmailAlreadyExistsError
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserCreate


class AuthService:
    def __init__(self) -> None:
        self.user_repository = UserRepository()

    def register(self, db: Session, payload: UserCreate) -> User:
        ##check if this use exist
        existing_user = self.user_repository.get_by_email(db, payload.email)

        ## this means that user with this email exist
        if existing_user is not None:
            # We will replace this with our domain exception next.
            EmailAlreadyExistsError("Email already registered")

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            password=hash_password(payload.password),
        )

        try:
            self.user_repository.create_user(db, user)
            ## db.commit() save the user in postgres
            db.commit()
            db.refresh(user)
            return user

        except Exception:
            db.rollback()
            raise
