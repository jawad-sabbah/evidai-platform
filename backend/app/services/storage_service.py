from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile


## return StoredFile in the save() insted of Tuple
@dataclass
class StoredFile:
    storage_key: str
    file_size: int
    checksum: str


## Local storage service handle save delete of file , Evidence Service deal with metaData
class LocalStorageService:
    def __init__(self, base_dir: str = "storage/evidence") -> None:
        self.base_dir = Path(base_dir)

    def save(
        self,
        file: UploadFile,
        case_id: UUID,
        evidence_id: UUID,
    ) -> StoredFile:
        case_dir = self.base_dir / str(case_id)
        case_dir.mkdir(parents=True, exist_ok=True)

        suffix = Path(file.filename or "").suffix
        storage_name = f"{evidence_id}{suffix}"

        storage_path = case_dir / storage_name

        hasher = sha256()
        file_size = 0

        with storage_path.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                destination.write(chunk)
                hasher.update(chunk)
                file_size += len(chunk)

        checksum = hasher.hexdigest()

        return StoredFile(
            storage_key=str(storage_path),
            file_size=file_size,
            checksum=checksum,
        )

    def delete(
        self,
        storage_key: str,
    ) -> None:
        path = Path(storage_key)

        if path.exists():
            path.unlink()


local_storage_service = LocalStorageService()
