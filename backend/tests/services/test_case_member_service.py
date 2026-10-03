from uuid import uuid4

import pytest

from app.core.config import settings
from app.core.enums import CaseRole, CaseType
from app.core.exceptions import (
    CaseMemberAlreadyExistsError,
    CaseMemberNotFoundError,
    CaseNotFoundError,
    LastOwnerError,
    UserNotFoundError,
)
from app.models.user import User
from app.schemas.case import CaseCreate
from app.schemas.case_member import CaseMemberCreate, CaseMemberUpdate
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


def create_case(
    db_session,
    title: str = "Case Member Service Test",
):
    return case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title=title,
            case_type=CaseType.FRAUD,
        ),
        created_by=settings.dev_user_id,
    )


def test_list_members_returns_owner(db_session):
    case = create_case(db_session)

    members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    assert len(members) == 1
    assert members[0].case_id == case.id
    assert members[0].user_id == case.created_by
    assert members[0].case_role == CaseRole.OWNER.value


def test_list_members_missing_case_raises_error(db_session):
    with pytest.raises(CaseNotFoundError):
        case_member_service.list_members(
            db=db_session,
            case_id=uuid4(),
        )


def test_add_member(db_session):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "service-investigator@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.INVESTIGATOR,
        ),
    )

    assert member.id is not None
    assert member.case_id == case.id
    assert member.user_id == user.id
    assert member.case_role == CaseRole.INVESTIGATOR.value


def test_add_member_to_missing_case_raises_error(db_session):
    user = create_user(
        db_session,
        "missing-case-service@example.com",
    )

    with pytest.raises(CaseNotFoundError):
        case_member_service.add_member(
            db=db_session,
            case_id=uuid4(),
            payload=CaseMemberCreate(
                user_id=user.id,
                case_role=CaseRole.VIEWER,
            ),
        )


def test_add_missing_user_raises_error(db_session):
    case = create_case(db_session)

    with pytest.raises(UserNotFoundError):
        case_member_service.add_member(
            db=db_session,
            case_id=case.id,
            payload=CaseMemberCreate(
                user_id=uuid4(),
                case_role=CaseRole.VIEWER,
            ),
        )


def test_add_duplicate_member_raises_error(db_session):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "duplicate-service@example.com",
    )

    payload = CaseMemberCreate(
        user_id=user.id,
        case_role=CaseRole.REVIEWER,
    )

    case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=payload,
    )

    with pytest.raises(CaseMemberAlreadyExistsError):
        case_member_service.add_member(
            db=db_session,
            case_id=case.id,
            payload=payload,
        )


def test_update_member_role(db_session):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "update-role-service@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    updated_member = case_member_service.update_member(
        db=db_session,
        case_id=case.id,
        member_id=member.id,
        payload=CaseMemberUpdate(
            case_role=CaseRole.REVIEWER,
        ),
    )

    assert updated_member.case_role == CaseRole.REVIEWER.value


def test_update_missing_member_raises_error(db_session):
    case = create_case(db_session)

    with pytest.raises(CaseMemberNotFoundError):
        case_member_service.update_member(
            db=db_session,
            case_id=case.id,
            member_id=uuid4(),
            payload=CaseMemberUpdate(
                case_role=CaseRole.VIEWER,
            ),
        )


def test_update_member_from_other_case_raises_error(db_session):
    first_case = create_case(
        db_session,
        title="First Service Case",
    )

    second_case = create_case(
        db_session,
        title="Second Service Case",
    )

    user = create_user(
        db_session,
        "cross-case-update-service@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=first_case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    with pytest.raises(CaseMemberNotFoundError):
        case_member_service.update_member(
            db=db_session,
            case_id=second_case.id,
            member_id=member.id,
            payload=CaseMemberUpdate(
                case_role=CaseRole.REVIEWER,
            ),
        )


def test_last_owner_cannot_be_demoted(db_session):
    case = create_case(db_session)

    members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    owner = members[0]

    with pytest.raises(LastOwnerError):
        case_member_service.update_member(
            db=db_session,
            case_id=case.id,
            member_id=owner.id,
            payload=CaseMemberUpdate(
                case_role=CaseRole.INVESTIGATOR,
            ),
        )


def test_owner_can_be_demoted_when_another_owner_exists(db_session):
    case = create_case(db_session)

    second_owner_user = create_user(
        db_session,
        "second-owner-service@example.com",
    )

    second_owner = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=second_owner_user.id,
            case_role=CaseRole.OWNER,
        ),
    )

    members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    original_owner = next(
        member
        for member in members
        if member.id != second_owner.id and member.case_role == CaseRole.OWNER.value
    )

    updated_member = case_member_service.update_member(
        db=db_session,
        case_id=case.id,
        member_id=original_owner.id,
        payload=CaseMemberUpdate(
            case_role=CaseRole.VIEWER,
        ),
    )

    assert updated_member.case_role == CaseRole.VIEWER.value


def test_delete_member(db_session):
    case = create_case(db_session)

    user = create_user(
        db_session,
        "delete-service@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    case_member_service.delete_member(
        db=db_session,
        case_id=case.id,
        member_id=member.id,
    )

    remaining_members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    remaining_ids = {item.id for item in remaining_members}

    assert member.id not in remaining_ids


def test_delete_missing_member_raises_error(db_session):
    case = create_case(db_session)

    with pytest.raises(CaseMemberNotFoundError):
        case_member_service.delete_member(
            db=db_session,
            case_id=case.id,
            member_id=uuid4(),
        )


def test_delete_member_from_other_case_raises_error(db_session):
    first_case = create_case(
        db_session,
        title="Delete First Case",
    )

    second_case = create_case(
        db_session,
        title="Delete Second Case",
    )

    user = create_user(
        db_session,
        "cross-case-delete-service@example.com",
    )

    member = case_member_service.add_member(
        db=db_session,
        case_id=first_case.id,
        payload=CaseMemberCreate(
            user_id=user.id,
            case_role=CaseRole.VIEWER,
        ),
    )

    with pytest.raises(CaseMemberNotFoundError):
        case_member_service.delete_member(
            db=db_session,
            case_id=second_case.id,
            member_id=member.id,
        )


def test_last_owner_cannot_be_deleted(db_session):
    case = create_case(db_session)

    members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    owner = members[0]

    with pytest.raises(LastOwnerError):
        case_member_service.delete_member(
            db=db_session,
            case_id=case.id,
            member_id=owner.id,
        )


def test_owner_can_be_deleted_when_another_owner_exists(db_session):
    case = create_case(db_session)

    second_owner_user = create_user(
        db_session,
        "delete-owner-service@example.com",
    )

    second_owner = case_member_service.add_member(
        db=db_session,
        case_id=case.id,
        payload=CaseMemberCreate(
            user_id=second_owner_user.id,
            case_role=CaseRole.OWNER,
        ),
    )

    case_member_service.delete_member(
        db=db_session,
        case_id=case.id,
        member_id=second_owner.id,
    )

    members = case_member_service.list_members(
        db=db_session,
        case_id=case.id,
    )

    owner_count = sum(member.case_role == CaseRole.OWNER.value for member in members)

    assert owner_count == 1
