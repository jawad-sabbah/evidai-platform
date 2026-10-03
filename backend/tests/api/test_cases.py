from uuid import uuid4

from app.core.config import settings


def test_list_cases(client, auth_headers):
    response = client.get(
        "/cases",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_case(client, auth_headers):
    response = client.post(
        "/cases",
        headers=auth_headers,
        json={
            "title": "Test Fraud Case",
            "description": "Created during automated testing",
            "case_type": "FRAUD",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Test Fraud Case"
    assert data["description"] == "Created during automated testing"
    assert data["case_type"] == "FRAUD"
    assert data["status"] == "OPEN"
    assert data["case_number"].startswith("CASE-")
    assert data["created_by"] == str(settings.dev_user_id)


def test_get_case(client, auth_headers):
    create_response = client.post(
        "/cases",
        headers=auth_headers,
        json={
            "title": "Case To Retrieve",
            "description": "Retrieve this case",
            "case_type": "OTHER",
        },
    )

    assert create_response.status_code == 201

    case_id = create_response.json()["id"]

    response = client.get(
        f"/cases/{case_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["id"] == case_id
    assert response.json()["title"] == "Case To Retrieve"


def test_get_case_not_found(client, auth_headers):
    case_id = uuid4()

    response = client.get(
        f"/cases/{case_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case not found"


def test_update_case(client, auth_headers):
    create_response = client.post(
        "/cases",
        headers=auth_headers,
        json={
            "title": "Original Case",
            "case_type": "OTHER",
        },
    )

    assert create_response.status_code == 201

    case_id = create_response.json()["id"]

    response = client.patch(
        f"/cases/{case_id}",
        headers=auth_headers,
        json={
            "title": "Updated Case",
            "status": "IN_REVIEW",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated Case"
    assert data["status"] == "IN_REVIEW"


def test_invalid_case_type(client, auth_headers):
    response = client.post(
        "/cases",
        headers=auth_headers,
        json={
            "title": "Invalid Type",
            "case_type": "INVALID_TYPE",
        },
    )

    assert response.status_code == 422


def test_list_cases_without_token_returns_401(client):
    response = client.get("/cases")

    assert response.status_code == 401


def test_create_case_without_token_returns_401(client):
    response = client.post(
        "/cases",
        json={
            "title": "Unauthorized Case",
            "case_type": "OTHER",
        },
    )

    assert response.status_code == 401


def test_get_case_without_token_returns_401(client):
    response = client.get("/cases/00000000-0000-0000-0000-000000000001")

    assert response.status_code == 401


def test_update_case_without_token_returns_401(client):
    response = client.patch(
        "/cases/00000000-0000-0000-0000-000000000001",
        json={
            "title": "Unauthorized Update",
        },
    )

    assert response.status_code == 401
