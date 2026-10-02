from fastapi import APIRouter, status

from app.api.dependencies import DbSession
from app.schemas.auth import LoginRequest, TokenResponse, UserCreate, UserResponse
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


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    payload: LoginRequest,
    db: DbSession,
) -> TokenResponse:
    access_token = auth_service.login(
        db=db,
        payload=payload,
    )

    return TokenResponse(
        access_token=access_token,
    )
