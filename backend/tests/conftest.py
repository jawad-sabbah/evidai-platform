"""
1. connect to your normal database
2. start a transaction for each test
3. give FastAPI a test session
4. rollback when the test ends

"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import engine
from app.main import app


@pytest.fixture
def db_engine():
    return engine


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()

    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
    )

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    token = create_access_token(settings.dev_user_id)

    return {"Authorization": f"Bearer {token}"}
