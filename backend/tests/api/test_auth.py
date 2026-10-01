def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "API Test User",
            "email": "api-register@example.com",
            "password": "StrongPassword123!",
        },
    )

   
    assert response.status_code == 201

    data = response.json()

    assert data["full_name"] == "API Test User"
    assert data["email"] == "api-register@example.com"
    assert data["system_role"] == "USER"
    assert data["status"] == "ACTIVE"

    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email_returns_409(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "duplicate-api@example.com",
        "password": "StrongPassword123!",
    }

    first_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/auth/register",
        json=payload,
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"


def test_register_invalid_email_returns_422(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Invalid Email User",
            "email": "not-an-email",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_short_password_returns_422(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Short Password User",
            "email": "short-password@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_register_missing_full_name_returns_422(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "missing-name@example.com",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 422


def test_register_response_does_not_expose_password_hash(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Safe Response User",
            "email": "safe-response@example.com",
            "password": "StrongPassword123!",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "password" not in data
    assert "password_hash" not in data
