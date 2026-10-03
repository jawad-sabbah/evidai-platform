from uuid import uuid4

import pytest

from app.core.config import settings
from app.core.enums import CaseStatus, CaseType
from app.core.exceptions import (
    CaseNotFoundError,
    InvalidCaseTransitionError,
)
from app.schemas.case import CaseCreate, CaseUpdate
from app.services.case_service import case_service


def create_case(
    db_session,
    title: str,
    case_type: CaseType = CaseType.OTHER,
    description: str | None = None,
):
    return case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title=title,
            description=description,
            case_type=case_type,
        ),
        created_by=settings.dev_user_id,
    )


def test_create_case(db_session):
    case = create_case(
        db_session,
        title="Service Test Case",
        description="Created from service test",
        case_type=CaseType.FRAUD,
    )

    assert case.id is not None
    assert case.title == "Service Test Case"
    assert case.description == "Created from service test"
    assert case.case_type == CaseType.FRAUD.value
    assert case.status == CaseStatus.OPEN.value
    assert case.case_number.startswith("CASE-")

    case_member = case_service.case_member_repository.get_by_case_and_user(
        db=db_session,
        case_id=case.id,
        user_id=case.created_by,
    )

    assert case_member is not None
    assert case_member.case_id == case.id
    assert case_member.user_id == case.created_by
    assert case_member.case_role == "OWNER"


def test_get_case(db_session):
    created_case = create_case(
        db_session,
        title="Get Case Test",
    )

    case = case_service.get_case(
        db=db_session,
        case_id=created_case.id,
    )

    assert case.id == created_case.id
    assert case.title == "Get Case Test"


def test_get_case_not_found(db_session):
    with pytest.raises(CaseNotFoundError):
        case_service.get_case(
            db=db_session,
            case_id=uuid4(),
        )


def test_update_case_title(db_session):
    case = create_case(
        db_session,
        title="Original Title",
    )

    updated_case = case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            title="Updated Title",
        ),
    )

    assert updated_case.title == "Updated Title"


def test_open_case_can_move_to_in_review(db_session):
    case = create_case(
        db_session,
        title="Review Transition",
    )

    updated_case = case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.IN_REVIEW,
        ),
    )

    assert updated_case.status == CaseStatus.IN_REVIEW.value


def test_in_review_case_can_close(db_session):
    case = create_case(
        db_session,
        title="Close Transition",
    )

    case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.IN_REVIEW,
        ),
    )

    closed_case = case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.CLOSED,
        ),
    )

    assert closed_case.status == CaseStatus.CLOSED.value
    assert closed_case.closed_at is not None


def test_closed_case_can_archive(db_session):
    case = create_case(
        db_session,
        title="Archive Transition",
    )

    case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.CLOSED,
        ),
    )

    archived_case = case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.ARCHIVED,
        ),
    )

    assert archived_case.status == CaseStatus.ARCHIVED.value


def test_archived_case_cannot_reopen(db_session):
    case = create_case(
        db_session,
        title="Invalid Transition",
    )

    case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.CLOSED,
        ),
    )

    case_service.update_case(
        db=db_session,
        case_id=case.id,
        payload=CaseUpdate(
            status=CaseStatus.ARCHIVED,
        ),
    )

    with pytest.raises(InvalidCaseTransitionError):
        case_service.update_case(
            db=db_session,
            case_id=case.id,
            payload=CaseUpdate(
                status=CaseStatus.OPEN,
            ),
        )


def test_case_number_format(db_session):
    case = create_case(
        db_session,
        title="Case Number Test",
    )

    parts = case.case_number.split("-")

    assert parts[0] == "CASE"
    assert len(parts[1]) == 4
    assert len(parts[2]) == 6
    assert parts[1].isdigit()
    assert parts[2].isdigit()
