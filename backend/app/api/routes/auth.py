from fastapi import APIRouter, status

from app.api.dependencies import DbSession
from app.schemas.auth import UserResponse
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserResponse,
    db: DbSession,
) -> UserResponse:
    return auth_service.register(
        db,
        payload,
    )
