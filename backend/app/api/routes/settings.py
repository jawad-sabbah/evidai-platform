from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.user_preference import PreferencesResponse, PreferencesUpdate
from app.services.user_preference_service import user_preference_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get(
    "/preferences",
    response_model=PreferencesResponse,
    status_code=status.HTTP_200_OK,
)
def get_preferences(
    db: DbSession,
    current_user: CurrentUser,
):
    preferences = user_preference_service.get_preferences(
        db=db,
        user_id=current_user.id,
    )

    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    return preferences


@router.patch(
    "/preferences",
    response_model=PreferencesResponse,
    status_code=status.HTTP_200_OK,
)
def update_preferences(
    payload: PreferencesUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    preferences = user_preference_service.update_preferences(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    if preferences is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found",
        )

    return preferences
