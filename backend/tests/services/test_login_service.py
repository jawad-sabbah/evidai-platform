import pytest

from app.core.exceptions import InvalidCredentialsError
from app.schemas.auth import LoginRequest, UserCreate
from app.services.auth_service import auth_service


def test_login_success(db_session):
    auth_service.register(
        db=db_session,
        payload=UserCreate(
            full_name="Service Login User",
            email="service-login@example.com",
            password="StrongPassword123!",
        ),
    )

    token = auth_service.login(
        db=db_session,
        payload=LoginRequest(
            email="service-login@example.com",
            password="StrongPassword123!",
        ),
    )

    assert isinstance(token, str)
    assert token


def test_login_wrong_password_raises_error(db_session):
    auth_service.register(
        db=db_session,
        payload=UserCreate(
            full_name="Wrong Password Service User",
            email="service-wrong-password@example.com",
            password="StrongPassword123!",
        ),
    )

    with pytest.raises(
        InvalidCredentialsError,
        match="Invalid email or password",
    ):
        auth_service.login(
            db=db_session,
            payload=LoginRequest(
                email="service-wrong-password@example.com",
                password="WrongPassword123!",
            ),
        )


def test_login_unknown_email_raises_error(db_session):
    with pytest.raises(
        InvalidCredentialsError,
        match="Invalid email or password",
    ):
        auth_service.login(
            db=db_session,
            payload=LoginRequest(
                email="unknown-service@example.com",
                password="StrongPassword123!",
            ),
        )


def test_disabled_user_cannot_login(db_session):
    user = auth_service.register(
        db=db_session,
        payload=UserCreate(
            full_name="Disabled User",
            email="disabled-user@example.com",
            password="StrongPassword123!",
        ),
    )

    user.status = "DISABLED"
    db_session.commit()

    with pytest.raises(InvalidCredentialsError):
        auth_service.login(
            db=db_session,
            payload=LoginRequest(
                email="disabled-user@example.com",
                password="StrongPassword123!",
            ),
        )
