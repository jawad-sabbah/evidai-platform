from fastapi import APIRouter, status

from app.api.dependencies import CurrentUser, DbSession
from app.schemas.notification_preference import (
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
)
from app.schemas.user_preference import PreferencesResponse, PreferencesUpdate
from app.services.notification_preference_service import notification_preference_service
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
    preferences = user_preference_service.get_or_create_preferences(
        db=db,
        user_id=current_user.id,
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
    return preferences


@router.get(
    "/notifications",
    response_model=NotificationPreferenceResponse,
    status_code=status.HTTP_200_OK,
)
def get_notification_preferences(
    db: DbSession,
    current_user: CurrentUser,
):
    preferences = notification_preference_service.get_preferences(
        db=db,
        user_id=current_user.id,
    )
    return preferences


@router.patch(
    "/notifications",
    response_model=NotificationPreferenceResponse,
    status_code=status.HTTP_200_OK,
)
def update_notification_preferences(
    payload: NotificationPreferenceUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    preferences = notification_preference_service.update_preferences(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )
    return preferences
