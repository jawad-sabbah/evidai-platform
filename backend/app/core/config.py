import os
from uuid import UUID

from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "")
    dev_user_id: UUID | None = (
        UUID(os.environ["DEV_USER_ID"])
        if os.getenv("DEV_USER_ID")
        else None
    )


settings = Settings()