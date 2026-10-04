from app.core.config import settings


def test_get_preferences_creates_defaults(
    client,
    db_session,
    auth_headers,
):
    response = client.get(
        "/settings/preferences",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["user_id"] == str(settings.dev_user_id)
    assert data["theme"] == "LIGHT"
    assert data["timezone"] == "UTC"
    assert data["date_format"] == "DD/MM/YYYY"
    assert data["default_landing_page"] == "DASHBOARD"


def test_get_preferences_returns_existing_row(
    client,
    db_session,
    auth_headers,
):
    first_response = client.get(
        "/settings/preferences",
        headers=auth_headers,
    )

    assert first_response.status_code == 200

    first_data = first_response.json()

    second_response = client.get(
        "/settings/preferences",
        headers=auth_headers,
    )

    assert second_response.status_code == 200

    second_data = second_response.json()

    assert second_data["id"] == first_data["id"]
    assert second_data["user_id"] == first_data["user_id"]


def test_update_preferences(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/preferences",
        headers=auth_headers,
        json={
            "theme": "DARK",
            "timezone": "Asia/Beirut",
            "date_format": "MM/DD/YYYY",
            "default_landing_page": "CASES",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["theme"] == "DARK"
    assert data["timezone"] == "Asia/Beirut"
    assert data["date_format"] == "MM/DD/YYYY"
    assert data["default_landing_page"] == "CASES"


def test_update_preferences_preserves_unsent_fields(
    client,
    auth_headers,
):
    initial_response = client.get(
        "/settings/preferences",
        headers=auth_headers,
    )

    assert initial_response.status_code == 200

    initial_data = initial_response.json()

    response = client.patch(
        "/settings/preferences",
        headers=auth_headers,
        json={
            "theme": "SYSTEM",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["theme"] == "SYSTEM"
    assert data["timezone"] == initial_data["timezone"]
    assert data["date_format"] == initial_data["date_format"]
    assert data["default_landing_page"] == initial_data["default_landing_page"]


def test_invalid_theme_returns_422(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/preferences",
        headers=auth_headers,
        json={
            "theme": "BLUE",
        },
    )

    assert response.status_code == 422


def test_invalid_default_landing_page_returns_422(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/preferences",
        headers=auth_headers,
        json={
            "default_landing_page": "UNKNOWN",
        },
    )

    assert response.status_code == 422


def test_get_preferences_without_token_returns_401(
    client,
):
    response = client.get(
        "/settings/preferences",
    )

    assert response.status_code == 401


def test_update_preferences_without_token_returns_401(
    client,
):
    response = client.patch(
        "/settings/preferences",
        json={
            "theme": "DARK",
        },
    )

    assert response.status_code == 401
