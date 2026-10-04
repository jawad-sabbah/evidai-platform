from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.repositories.user_repository import UserRepository


def test_get_current_user_profile(
    client,
    auth_headers,
):
    response = client.get(
        "/auth/me",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == str(settings.dev_user_id)
    assert "full_name" in data
    assert "email" in data
    assert "system_role" in data
    assert "status" in data

    assert "password" not in data
    assert "password_hash" not in data


def test_get_current_user_profile_without_token_returns_401(
    client,
):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_change_password_success(
    client,
    db_session,
    auth_headers,
):
    user_repository = UserRepository()

    user = user_repository.get_by_id(
        db=db_session,
        user_id=settings.dev_user_id,
    )

    original_hash = user.password_hash

    user.password_hash = hash_password("OldPassword123!")
    db_session.flush()

    response = client.patch(
        "/auth/password",
        headers=auth_headers,
        json={
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 204

    db_session.refresh(user)

    assert user.password_hash != original_hash
    assert verify_password(
        "NewPassword123!",
        user.password_hash,
    )


def test_change_password_wrong_current_password_returns_400(
    client,
    db_session,
    auth_headers,
):
    user_repository = UserRepository()

    user = user_repository.get_by_id(
        db=db_session,
        user_id=settings.dev_user_id,
    )

    user.password_hash = hash_password("CorrectPassword123!")
    db_session.flush()

    response = client.patch(
        "/auth/password",
        headers=auth_headers,
        json={
            "current_password": "WrongPassword123!",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Current password is incorrect"


def test_change_password_without_token_returns_401(
    client,
):
    response = client.patch(
        "/auth/password",
        json={
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 401


def test_disabled_user_cannot_access_authenticated_endpoint(
    client,
    db_session,
    auth_headers,
):
    user_repository = UserRepository()

    user = user_repository.get_by_id(
        db=db_session,
        user_id=settings.dev_user_id,
    )

    user.status = "DISABLED"
    db_session.flush()

    response = client.get(
        "/auth/me",
        headers=auth_headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"


def test_disabled_user_cannot_change_password(
    client,
    db_session,
    auth_headers,
):
    user_repository = UserRepository()

    user = user_repository.get_by_id(
        db=db_session,
        user_id=settings.dev_user_id,
    )

    user.status = "DISABLED"
    db_session.flush()

    response = client.patch(
        "/auth/password",
        headers=auth_headers,
        json={
            "current_password": "Anything123!",
            "new_password": "NewPassword123!",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"
