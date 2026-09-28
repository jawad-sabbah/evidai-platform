from uuid import uuid4

from app.core.config import settings


def test_list_cases(client):
    response = client.get("/cases")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_case(client):
    response = client.post(
        "/cases",
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


def test_get_case(client):
    create_response = client.post(
        "/cases",
        json={
            "title": "Case To Retrieve",
            "description": "Retrieve this case",
            "case_type": "OTHER",
        },
    )

    case_id = create_response.json()["id"]

    response = client.get(f"/cases/{case_id}")

    assert response.status_code == 200
    assert response.json()["id"] == case_id
    assert response.json()["title"] == "Case To Retrieve"


def test_get_case_not_found(client):
    case_id = uuid4()

    response = client.get(f"/cases/{case_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Case not found"


def test_update_case(client):
    create_response = client.post(
        "/cases",
        json={
            "title": "Original Case",
            "case_type": "OTHER",
        },
    )

    case_id = create_response.json()["id"]

    response = client.patch(
        f"/cases/{case_id}",
        json={
            "title": "Updated Case",
            "status": "IN_REVIEW",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "Updated Case"
    assert data["status"] == "IN_REVIEW"


def test_invalid_case_type(client):
    response = client.post(
        "/cases",
        json={
            "title": "Invalid Type",
            "case_type": "INVALID_TYPE",
        },
    )

    assert response.status_code == 422
