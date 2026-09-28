##This makes one place responsible for loading every model.

from app.models.ai_message import AIMessage
from app.models.ai_message_citation import AIMessageCitation
from app.models.ai_session import AISession
from app.models.case import Case
from app.models.case_member import CaseMember
from app.models.claim import Claim
from app.models.claim_evidence import ClaimEvidence
from app.models.entity import Entity
from app.models.entity_mention import EntityMention
from app.models.event import Event
from app.models.event_entity import EventEntity
from app.models.event_evidence import EventEvidence
from app.models.evidence import Evidence
from app.models.evidence_chunk import EvidenceChunk
from app.models.evidence_page import EvidencePage
from app.models.finding import Finding
from app.models.finding_evidence import FindingEvidence
from app.models.flag import Flag
from app.models.flag_evidence import FlagEvidence
from app.models.notification_preference import NotificationPreference
from app.models.processing_job import ProcessingJob
from app.models.processing_step import ProcessingStep
from app.models.relationship import Relationship
from app.models.relationship_evidence import RelationshipEvidence
from app.models.report import Report
from app.models.report_citation import ReportCitation
from app.models.report_finding import ReportFinding
from app.models.report_section import ReportSection
from app.models.user import User
from app.models.user_preference import UserPreference

__all__ = [
    "AIMessage",
    "AIMessageCitation",
    "AISession",
    "Case",
    "CaseMember",
    "Claim",
    "ClaimEvidence",
    "Entity",
    "EntityMention",
    "Event",
    "EventEntity",
    "EventEvidence",
    "Evidence",
    "EvidenceChunk",
    "EvidencePage",
    "Finding",
    "FindingEvidence",
    "Flag",
    "FlagEvidence",
    "NotificationPreference",
    "ProcessingJob",
    "ProcessingStep",
    "Relationship",
    "RelationshipEvidence",
    "Report",
    "ReportCitation",
    "ReportFinding",
    "ReportSection",
    "User",
    "UserPreference",
]
