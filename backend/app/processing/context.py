from dataclasses import dataclass, field
from typing import Any
from uuid import UUID


# Each processing job gets its own context.
@dataclass
class ProcessingContext:
    job_id: UUID
    data: dict[str, Any] = field(default_factory=dict)
