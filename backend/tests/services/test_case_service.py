from uuid import uuid4

import pytest

from app.core.enums import CaseStatus, CaseType
from app.core.exceptions import (
    CaseNotFoundError,
    InvalidCaseTransitionError,
)
from app.schemas.case import CaseCreate, CaseUpdate
from app.services.case_service import case_service


def test_create_case(db_session):
    payload = CaseCreate(
        title="Service Test Case",
        description="Created from service test",
        case_type=CaseType.FRAUD,
    )

    case = case_service.create_case(
        db=db_session,
        payload=payload,
    )

    assert case.id is not None
    assert case.title == "Service Test Case"
    assert case.description == "Created from service test"
    assert case.case_type == CaseType.FRAUD.value
    assert case.status == CaseStatus.OPEN.value
    assert case.case_number.startswith("CASE-")


def test_get_case(db_session):
    payload = CaseCreate(
        title="Get Case Test",
        case_type=CaseType.OTHER,
    )

    created_case = case_service.create_case(
        db=db_session,
        payload=payload,
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Original Title",
            case_type=CaseType.OTHER,
        ),
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Review Transition",
            case_type=CaseType.OTHER,
        ),
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Close Transition",
            case_type=CaseType.OTHER,
        ),
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Archive Transition",
            case_type=CaseType.OTHER,
        ),
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Invalid Transition",
            case_type=CaseType.OTHER,
        ),
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
    case = case_service.create_case(
        db=db_session,
        payload=CaseCreate(
            title="Case Number Test",
            case_type=CaseType.OTHER,
        ),
    )

    parts = case.case_number.split("-")

    assert parts[0] == "CASE"
    assert len(parts[1]) == 4
    assert len(parts[2]) == 6
    assert parts[1].isdigit()
    assert parts[2].isdigit()
