from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    CaseConflictError,
    CaseNotFoundError,
    ConfigurationError,
    InvalidCaseTransitionError,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(CaseNotFoundError)
    async def case_not_found_handler(
        request: Request,
        exc: CaseNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(InvalidCaseTransitionError)
    async def invalid_transition_handler(
        request: Request,
        exc: InvalidCaseTransitionError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(CaseConflictError)
    async def case_conflict_handler(
        request: Request,
        exc: CaseConflictError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ConfigurationError)
    async def configuration_error_handler(
        request: Request,
        exc: ConfigurationError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Server configuration error"},
        )
