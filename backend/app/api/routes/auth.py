from fastapi import APIRouter, status

from app.api.dependencies import DbSession
from app.schemas.auth import UserCreate, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


## use the UserCreate as input, and UserResponse as the response output
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserCreate,
    db: DbSession,
) -> UserResponse:
    return auth_service.register(
        db=db,
        payload=payload,
    )
