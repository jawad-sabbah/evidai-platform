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


class ProcessingJobNotFoundError(Exception):
    """Raised when a processing job cannot be found."""


class InvalidProcessingJobStatusError(Exception):
    """Raised when a processing job is not in a processable state."""


class EvidenceFileLoadingError(Exception):
    """Base exception for failures while loading stored evidence files."""


class EvidenceFileNotFoundError(EvidenceFileLoadingError):
    """Raised when the original evidence file is missing or inaccessible."""


class InvalidEvidenceStoragePathError(EvidenceFileLoadingError):
    """Raised when an evidence storage path is outside its permitted directory."""


class UnsupportedEvidenceFileTypeError(InvalidEvidenceFileError):
    """Raised when an evidence file format is not supported."""


class EvidenceFileTypeMismatchError(InvalidEvidenceFileError):
    """Raised when the declared file type does not match its contents."""


class EvidenceFileSizeError(InvalidEvidenceFileError):
    """Raised when an evidence file violates file size requirements."""


class EvidenceFileIntegrityError(InvalidEvidenceFileError):
    """Raised when evidence content does not match its stored metadata."""


class EvidenceStorageConflictError(Exception):
    """Raised when an evidence file already exists at its destination."""


class UnsafeEvidenceArchiveError(InvalidEvidenceFileError):
    """Raised when an evidence archive violates security limits."""


class MalformedEvidenceFileError(InvalidEvidenceFileError):
    """Raised when evidence content has an invalid document structure."""


class UnsupportedEvidenceExtractorError(Exception):
    """Raised when no extractor is registered for an evidence format."""


class PdfExtractionError(Exception):
    """Raised when PDF content extraction fails."""


class EncryptedEvidencePdfError(PdfExtractionError):
    """Raised when PDF extraction requires decryption."""


class PdfExtractionLimitError(PdfExtractionError):
    """Raised when a PDF exceeds configured extraction limits."""


class DocxExtractionError(Exception):
    """Raised when Word document content extraction fails."""


class DocxExtractionLimitError(DocxExtractionError):
    """Raised when Word content exceeds extraction safety limits."""


class TextExtractionError(Exception):
    """Raised when text or structured content extraction fails."""


class TextExtractionLimitError(TextExtractionError):
    """Raised when text evidence exceeds extraction resource limits."""


class SpreadsheetExtractionError(Exception):
    """Raised when spreadsheet evidence cannot be extracted."""


class SpreadsheetExtractionLimitError(SpreadsheetExtractionError):
    """Raised when spreadsheet processing limits are exceeded."""
