from uuid import uuid4

from app.core.enums import CaseRole, CaseType
from app.models.user import User
from app.schemas.case import CaseCreate
from app.schemas.case_member import CaseMemberCreate
from app.services.case_member_service import case_member_service
from app.services.case_service import case_service


def create_user(db_session, email: str) -> User:
    user = User(
        full_name="Test User",
        email=email,
        password_hash="TEST_ONLY",
        system_role="USER",
        status="ACTIVE",
    )

    db_session.add(user)
    db_session.flush()

    return user


def create_case(db_session):
    return case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Case Member Test Case",
            case_type=CaseType.FRAUD,
        ),
    )


def test_list_case_members_returns_owner(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    response = client.get(
        f"/cases/{case.id}/members",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["case_id"] == str(case.id)
    assert data[0]["user_id"] == str(case.created_by)
    assert data[0]["case_role"] == CaseRole.OWNER.value


def test_add_case_member(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "investigator@example.com",
    )

    response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "INVESTIGATOR",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["case_id"] == str(case.id)
    assert data["user_id"] == str(user.id)
    assert data["case_role"] == "INVESTIGATOR"


def test_add_member_with_invalid_role_returns_422(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "invalid-role@example.com",
    )

    response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "INVALID_ROLE",
        },
    )

    assert response.status_code == 422


def test_add_member_with_invalid_user_uuid_returns_422(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": "not-a-uuid",
            "case_role": "VIEWER",
        },
    )

    assert response.status_code == 422


def test_add_member_to_missing_case_returns_404(
    client,
    db_session,
    auth_headers,
):
    user = create_user(
        db_session,
        "missing-case@example.com",
    )

    response = client.post(
        f"/cases/{uuid4()}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "VIEWER",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case not found"


def test_add_missing_user_returns_404(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(uuid4()),
            "case_role": "VIEWER",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_add_duplicate_member_returns_409(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "duplicate@example.com",
    )

    first_response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "INVESTIGATOR",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "VIEWER",
        },
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "User is already a member of this case"


def test_update_case_member_role(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "reviewer@example.com",
    )

    create_response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "VIEWER",
        },
    )

    member_id = create_response.json()["id"]

    response = client.patch(
        f"/cases/{case.id}/members/{member_id}",
        headers=auth_headers,
        json={
            "case_role": "REVIEWER",
        },
    )

    assert response.status_code == 200
    assert response.json()["case_role"] == "REVIEWER"


def test_update_member_with_invalid_role_returns_422(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "bad-update-role@example.com",
    )

    create_response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "VIEWER",
        },
    )

    member_id = create_response.json()["id"]

    response = client.patch(
        f"/cases/{case.id}/members/{member_id}",
        headers=auth_headers,
        json={
            "case_role": "INVALID_ROLE",
        },
    )

    assert response.status_code == 422


def test_update_missing_member_returns_404(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    response = client.patch(
        f"/cases/{case.id}/members/{uuid4()}",
        headers=auth_headers,
        json={
            "case_role": "VIEWER",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case member not found"


def test_update_member_from_other_case_returns_404(
    client,
    db_session,
    auth_headers,
):
    first_case = create_case(db_session)

    second_case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Other Case",
            case_type=CaseType.OTHER,
        ),
    )

    user = create_user(
        db_session,
        "other-case@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=first_case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    response = client.patch(
        f"/cases/{second_case.id}/members/{member.id}",
        headers=auth_headers,
        json={
            "case_role": "REVIEWER",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case member not found"


def test_cannot_demote_last_owner(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    members_response = client.get(
        f"/cases/{case.id}/members",
        headers=auth_headers,
    )

    owner_id = members_response.json()[0]["id"]

    response = client.patch(
        f"/cases/{case.id}/members/{owner_id}",
        headers=auth_headers,
        json={
            "case_role": "INVESTIGATOR",
        },
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "The last owner of a case cannot be removed or demoted"
    )


def test_owner_can_be_demoted_when_another_owner_exists(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    second_owner_user = create_user(
        db_session,
        "second-owner@example.com",
    )

    second_owner = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=second_owner_user.id,
            case_role=CaseRole.OWNER,
        ),
    )

    members_response = client.get(
        f"/cases/{case.id}/members",
        headers=auth_headers,
    )

    owner_ids = [
        item["id"] for item in members_response.json() if item["case_role"] == "OWNER"
    ]

    original_owner_id = next(
        member_id for member_id in owner_ids if member_id != str(second_owner.id)
    )

    response = client.patch(
        f"/cases/{case.id}/members/{original_owner_id}",
        headers=auth_headers,
        json={
            "case_role": "VIEWER",
        },
    )

    assert response.status_code == 200
    assert response.json()["case_role"] == "VIEWER"


def test_delete_case_member(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "delete-member@example.com",
    )

    create_response = client.post(
        f"/cases/{case.id}/members",
        headers=auth_headers,
        json={
            "user_id": str(user.id),
            "case_role": "VIEWER",
        },
    )

    member_id = create_response.json()["id"]

    response = client.delete(
        f"/cases/{case.id}/members/{member_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    members_response = client.get(
        f"/cases/{case.id}/members",
        headers=auth_headers,
    )

    remaining_ids = {member["id"] for member in members_response.json()}

    assert member_id not in remaining_ids


def test_delete_missing_member_returns_404(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    response = client.delete(
        f"/cases/{case.id}/members/{uuid4()}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case member not found"


def test_delete_member_from_other_case_returns_404(
    client,
    db_session,
    auth_headers,
):
    first_case = create_case(db_session)

    second_case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Second Case",
            case_type=CaseType.OTHER,
        ),
    )

    user = create_user(
        db_session,
        "wrong-case-delete@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=first_case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    response = client.delete(
        f"/cases/{second_case.id}/members/{member.id}",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case member not found"


def test_cannot_delete_last_owner(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    members_response = client.get(
        f"/cases/{case.id}/members",
        headers=auth_headers,
    )

    owner_id = members_response.json()[0]["id"]

    response = client.delete(
        f"/cases/{case.id}/members/{owner_id}",
        headers=auth_headers,
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "The last owner of a case cannot be removed or demoted"
    )


def test_owner_can_be_deleted_when_another_owner_exists(
    client,
    db_session,
    auth_headers,
):
    case = create_case(db_session)

    second_owner_user = create_user(
        db_session,
        "deletable-owner@example.com",
    )

    second_owner = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=second_owner_user.id,
            case_role=CaseRole.OWNER,
        ),
    )

    response = client.delete(
        f"/cases/{case.id}/members/{second_owner.id}",
        headers=auth_headers,
    )

    assert response.status_code == 204


def test_list_members_for_missing_case_returns_404(
    client,
    auth_headers,
):
    response = client.get(
        f"/cases/{uuid4()}/members",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Case not found"


def test_list_case_members_without_token_returns_401(
    client,
    db_session,
):
    case = create_case(db_session)

    response = client.get(
        f"/cases/{case.id}/members",
    )

    assert response.status_code == 401
