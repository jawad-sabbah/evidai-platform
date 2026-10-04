def test_get_ai_settings_returns_defaults(
    client,
    auth_headers,
):
    response = client.get(
        "/settings/ai",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["ai_response_style"] == "BALANCED"
    assert data["ai_show_citations"] is True
    assert data["ai_show_confidence"] is True


def test_update_ai_response_style(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_response_style": "DETAILED",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["ai_response_style"] == "DETAILED"


def test_update_ai_boolean_preferences(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_show_citations": False,
            "ai_show_confidence": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["ai_show_citations"] is False
    assert data["ai_show_confidence"] is False


def test_update_ai_settings_preserves_unsent_fields(
    client,
    auth_headers,
):
    initial_response = client.get(
        "/settings/ai",
        headers=auth_headers,
    )

    assert initial_response.status_code == 200

    initial_data = initial_response.json()

    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_response_style": "CONCISE",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["ai_response_style"] == "CONCISE"
    assert data["ai_show_citations"] == initial_data["ai_show_citations"]
    assert data["ai_show_confidence"] == initial_data["ai_show_confidence"]


def test_invalid_ai_response_style_returns_422(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_response_style": "INVALID",
        },
    )

    assert response.status_code == 422


def test_ai_show_citations_requires_boolean(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_show_citations": "true",
        },
    )

    assert response.status_code == 422


def test_ai_show_confidence_requires_boolean(
    client,
    auth_headers,
):
    response = client.patch(
        "/settings/ai",
        headers=auth_headers,
        json={
            "ai_show_confidence": 1,
        },
    )

    assert response.status_code == 422


def test_get_ai_settings_without_token_returns_401(
    client,
):
    response = client.get(
        "/settings/ai",
    )

    assert response.status_code == 401


def test_update_ai_settings_without_token_returns_401(
    client,
):
    response = client.patch(
        "/settings/ai",
        json={
            "ai_response_style": "DETAILED",
        },
    )

    assert response.status_code == 401
