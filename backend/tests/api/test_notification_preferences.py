from app.core.config import settings


def test_get_notification_preferences_creates_defaults(
    client,
    auth_headers,
):
    response = client.get(
        "/settings/notifications",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == str(settings.dev_user_id)
    assert data["evidence_failed"] is True
    assert data["evidence_ready"] is True
    assert data["review_assigned"] is True
    assert data["finding_verified"] is True
    assert data["report_ready"] is True
    assert data["mentions"] is True
    assert data["email_notifications"] is True
    assert data["in_app_notifications"] is True


def test_get_notification_preferences_returns_existing_row(
    client,
    auth_headers,
):
    first_response = client.get(
        "/settings/notifications",
        headers=auth_headers,
    )

    assert first_response.status_code == 200

    second_response = client.get(
        "/settings/notifications",
        headers=auth_headers,
    )

    assert second_response.status_code == 200

    assert second_response.json()["id"] == first_response.json()["id"]


def test_update_notification_preferences(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/notifications",
        headers=auth_headers,
        json={
            "evidence_failed": False,
            "mentions": False,
            "email_notifications": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["evidence_failed"] is False
    assert data["mentions"] is False
    assert data["email_notifications"] is False


def test_update_notification_preferences_preserves_unsent_fields(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/notifications",
        headers=auth_headers,
        json={
            "email_notifications": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email_notifications"] is False
    assert data["evidence_failed"] is True
    assert data["evidence_ready"] is True
    assert data["review_assigned"] is True
    assert data["finding_verified"] is True
    assert data["report_ready"] is True
    assert data["mentions"] is True
    assert data["in_app_notifications"] is True


def test_invalid_notification_value_returns_422(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/notifications",
        headers=auth_headers,
        json={
            "mentions": "invalid",
        },
    )

    assert response.status_code == 422


def test_get_notification_preferences_without_token_returns_401(
    client,
):
    response = client.get(
        "/settings/notifications",
    )

    assert response.status_code == 401


def test_update_notification_preferences_without_token_returns_401(
    client,
):
    response = client.patch(
        "/settings/notifications",
        json={
            "mentions": False,
        },
    )

    assert response.status_code == 401
