def test_get_profile_returns_current_user(
    client,
    auth_headers,
):
    response = client.get(
        "/settings/profile",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "id" in data
    assert "full_name" in data
    assert "email" in data
    assert "system_role" in data
    assert "status" in data


def test_get_profile_returns_valid_role(
    client,
    auth_headers,
):
    response = client.get(
        "/settings/profile",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["system_role"] in {
        "ADMIN",
        "USER",
    }


def test_get_profile_does_not_return_password_hash(
    client,
    auth_headers,
):
    response = client.get(
        "/settings/profile",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert "password_hash" not in data


def test_get_profile_without_token_returns_401(
    client,
):
    response = client.get("/settings/profile")

    assert response.status_code == 401
