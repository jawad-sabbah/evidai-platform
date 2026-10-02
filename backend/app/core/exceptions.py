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
