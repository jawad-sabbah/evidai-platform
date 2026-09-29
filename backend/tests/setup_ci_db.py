from sqlalchemy import create_engine, text

from app import models
from app.core.config import settings
from app.db.base import Base

_ = models

engine = create_engine(settings.database_url)


with engine.begin() as connection:
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))


Base.metadata.create_all(bind=engine)


with engine.begin() as connection:
    connection.execute(
        text(
            """
            INSERT INTO users (
                id,
                full_name,
                email,
                password_hash,
                system_role,
                status
            )
            VALUES (
                :id,
                'CI Development User',
                'ci-dev@evidai.local',
                'CI_ONLY',
                'ADMIN',
                'ACTIVE'
            )
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {
            "id": str(settings.dev_user_id),
        },
    )
