from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
import pytest

from app.core.config import settings
from app.core.exceptions import InvalidTokenError
from app.core.security import create_access_token, decode_access_token


def test_create_access_token_contains_user_id():
    user_id = uuid4()

    token = create_access_token(user_id)

    payload = decode_access_token(token)

    assert payload["sub"] == str(user_id)


def test_create_access_token_contains_expiration():
    user_id = uuid4()

    token = create_access_token(user_id)

    payload = decode_access_token(token)

    assert "exp" in payload


def test_decode_valid_access_token():
    user_id = uuid4()

    token = create_access_token(user_id)

    payload = decode_access_token(token)

    assert payload["sub"] == str(user_id)


def test_decode_token_with_invalid_signature_raises_error():
    user_id = uuid4()

    payload = {
        "sub": str(user_id),
        "exp": datetime.now(UTC) + timedelta(minutes=30),
    }

    token = jwt.encode(
        payload,
        "wrong-secret",
        algorithm=settings.jwt_algorithm,
    )

    with pytest.raises(InvalidTokenError):
        decode_access_token(token)


def test_decode_expired_token_raises_error():
    user_id = uuid4()

    payload = {
        "sub": str(user_id),
        "exp": datetime.now(UTC) - timedelta(minutes=1),
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    with pytest.raises(
        InvalidTokenError,
        match="Access token has expired",
    ):
        decode_access_token(token)


def test_decode_malformed_token_raises_error():
    with pytest.raises(InvalidTokenError):
        decode_access_token("this-is-not-a-valid-jwt")
