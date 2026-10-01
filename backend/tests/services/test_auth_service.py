import pytest

from app.core.exceptions import EmailAlreadyExistsError
from app.schemas.auth import UserCreate
from app.services.auth_service import auth_service


def test_register_user(db_session):
    payload = UserCreate(
        full_name="Test User",
        email="service-register@example.com",
        password="StrongPassword123!",
    )

    user = auth_service.register(
        db=db_session,
        payload=payload,
    )

    assert user.id is not None
    assert user.full_name == "Test User"
    assert user.email == "service-register@example.com"
    assert user.password_hash != payload.password
    assert user.password_hash.startswith("$argon2")


def test_register_duplicate_email_raises_error(db_session):
    payload = UserCreate(
        full_name="First User",
        email="duplicate-register@example.com",
        password="StrongPassword123!",
    )

    auth_service.register(
        db=db_session,
        payload=payload,
    )

    with pytest.raises(EmailAlreadyExistsError):
        auth_service.register(
            db=db_session,
            payload=UserCreate(
                full_name="Second User",
                email="duplicate-register@example.com",
                password="AnotherPassword123!",
            ),
        )


def test_password_is_hashed_before_storage(db_session):
    plain_password = "VeryStrongPassword123!"

    user = auth_service.register(
        db=db_session,
        payload=UserCreate(
            full_name="Hash Test User",
            email="hash-test@example.com",
            password=plain_password,
        ),
    )

    assert user.password_hash != plain_password
    assert plain_password not in user.password_hash


def test_registered_user_has_default_role_and_status(db_session):
    user = auth_service.register(
        db=db_session,
        payload=UserCreate(
            full_name="Default Values User",
            email="defaults@example.com",
            password="StrongPassword123!",
        ),
    )

    assert user.system_role == "USER"
    assert user.status == "ACTIVE"
