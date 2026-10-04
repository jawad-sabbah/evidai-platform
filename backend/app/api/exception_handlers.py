from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    CaseConflictError,
    CaseMemberAlreadyExistsError,
    CaseMemberNotFoundError,
    CaseNotFoundError,
    ConfigurationError,
    DisabledUserError,
    EmailAlreadyExistsError,
    ForbiddenError,
    InvalidCaseTransitionError,
    InvalidCredentialsError,
    InvalidCurrentPasswordError,
    InvalidTokenError,
    LastOwnerError,
    UserNotFoundError,
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

    @app.exception_handler(CaseMemberNotFoundError)
    async def case_member_not_found_handler(
        request: Request,
        exc: CaseMemberNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(UserNotFoundError)
    async def user_not_found_handler(
        request: Request,
        exc: UserNotFoundError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(CaseMemberAlreadyExistsError)
    async def case_member_already_exists_handler(
        request: Request,
        exc: CaseMemberAlreadyExistsError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(LastOwnerError)
    async def last_owner_handler(
        request: Request,
        exc: LastOwnerError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(EmailAlreadyExistsError)
    async def email_already_exists_handler(
        request: Request,
        exc: EmailAlreadyExistsError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(InvalidTokenError)
    async def invalid_token_handler(
        request: Request,
        exc: InvalidTokenError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": str(exc)},
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    @app.exception_handler(InvalidCredentialsError)
    async def invalid_credentials_handler(
        request: Request,
        exc: InvalidCredentialsError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(
        request: Request,
        exc: ForbiddenError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": str(exc)},
        )

    @app.exception_handler(InvalidCurrentPasswordError)
    async def invalid_current_password_handler(
        request: Request,
        exc: InvalidCurrentPasswordError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(DisabledUserError)
    async def disabled_user_handler(
        request: Request,
        exc: DisabledUserError,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": str(exc)},
        )
