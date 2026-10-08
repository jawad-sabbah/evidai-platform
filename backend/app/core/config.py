import os
from uuid import UUID

from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "")
    dev_user_id: UUID | None = (
        UUID(os.environ["DEV_USER_ID"]) if os.getenv("DEV_USER_ID") else None
    )

    jwt_secret_key: str = os.getenv(
        "JWT_SECRET_KEY",
        "",
    )

    jwt_algorithm: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )

    jwt_access_token_expire_minutes: int = int(
        os.getenv(
            "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
            "30",
        )
    )

    redis_url: str = "redis://localhost:6379/0"


settings = Settings()
