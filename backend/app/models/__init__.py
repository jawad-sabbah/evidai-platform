##This makes one place responsible for loading every model.

from app.models.user import User
from app.models.case import Case
from app.models.case_member import CaseMember

from app.models.evidence import Evidence
from app.models.processing_job import ProcessingJob
from app.models.processing_step import ProcessingStep
from app.models.evidence_page import EvidencePage
from app.models.evidence_chunk import EvidenceChunk

from app.models.entity import Entity
from app.models.entity_mention import EntityMention

from app.models.relationship import Relationship
from app.models.relationship_evidence import RelationshipEvidence

from app.models.event import Event
from app.models.event_entity import EventEntity
from app.models.event_evidence import EventEvidence

from app.models.claim import Claim
from app.models.claim_evidence import ClaimEvidence

from app.models.flag import Flag
from app.models.flag_evidence import FlagEvidence

from app.models.finding import Finding
from app.models.finding_evidence import FindingEvidence

from app.models.ai_session import AISession
from app.models.ai_message import AIMessage
from app.models.ai_message_citation import AIMessageCitation

from app.models.report import Report
from app.models.report_section import ReportSection
from app.models.report_finding import ReportFinding
from app.models.report_citation import ReportCitation

from app.models.user_preference import UserPreference
from app.models.notification_preference import NotificationPreference