class CaseNotFoundError(Exception):
    pass


class InvalidCaseTransitionError(Exception):
    pass


class ConfigurationError(Exception):
    pass


class CaseConflictError(Exception):
    pass


class CaseMemberNotFoundError(Exception):
    pass


class CaseMemberAlreadyExistsError(Exception):
    pass


class LastOwnerError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class EmailAlreadyExistsError(Exception):
    pass


class InvalidTokenError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidCurrentPasswordError(Exception):
    pass


class ForbiddenError(Exception):
    pass


class DisabledUserError(Exception):
    pass


class EvidenceUploadError(Exception):
    """Raised when an evidence file cannot be uploaded or stored."""


class InvalidEvidenceFileError(Exception):
    """Raised when an uploaded evidence file is invalid."""


class EvidenceNotFoundError(Exception):
    """Raised when evidence cannot be found in the requested case."""


class EvidenceProcessingError(Exception):
    """Raised when evidence cannot be modified during active processing."""
