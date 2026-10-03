from collections.abc import Generator
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.enums import CaseRole, SystemRole
from app.core.exceptions import ForbiddenError, InvalidTokenError
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User
from app.repositories.case_member_repository import CaseMemberRepository
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
)


## get_db() create sqlalchemy session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


## DbSession give reusable db dependency
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    db: DbSession,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    payload = decode_access_token(token)

    user_id = payload.get("sub")

    if user_id is None:
        raise InvalidTokenError("Invalid access token")

    user_repository = UserRepository()

    try:
        user_uuid = UUID(user_id)
    except (ValueError, TypeError) as exc:
        raise InvalidTokenError("Invalid access token") from exc

    user = user_repository.get_by_id(
        db,
        user_uuid,
    )

    if user is None:
        raise InvalidTokenError("User not found")

    return user


## reusable authenticated-user dependency
CurrentUser = Annotated[User, Depends(get_current_user)]


def require_admin(
    current_user: CurrentUser,
) -> User:
    if current_user.system_role != SystemRole.ADMIN.value:
        raise ForbiddenError("Admin access required")

    return current_user


AdminUser = Annotated[User, Depends(require_admin)]


def require_case_member(
    case_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> User:
    repository = CaseMemberRepository()

    membership = repository.get_by_case_and_user(
        db=db,
        case_id=case_id,
        user_id=current_user.id,
    )

    if membership is None:
        raise ForbiddenError("You are not a member of this case")

    return current_user


CaseMemberUser = Annotated[
    User,
    Depends(require_case_member),
]


def require_case_owner(
    case_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> User:
    repository = CaseMemberRepository()

    membership = repository.get_by_case_and_user(
        db=db,
        case_id=case_id,
        user_id=current_user.id,
    )

    if membership is None:
        raise ForbiddenError("You are not a member of this case")

    if membership.case_role != CaseRole.OWNER.value:
        raise ForbiddenError("Case owner access required")

    return current_user


CaseOwnerUser = Annotated[
    User,
    Depends(require_case_owner),
]
