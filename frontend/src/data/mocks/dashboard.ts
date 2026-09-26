/* =========================================================
   TYPES
========================================================= */

export type CaseStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "CLOSED"
  | "ARCHIVED";

export type EvidenceStatus =
  | "READY"
  | "PROCESSING"
  | "FAILED"
  | "QUEUED";

type RecentCase = {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: CaseStatus;
  updatedAt: string;
};

type AttentionItem = {
  id: string;
  label: string;
  description: string;
  count: number;
  href: string;

  tone:
    | "warning"
    | "danger"
    | "neutral";
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;

  type:
    | "EVIDENCE"
    | "ENTITY"
    | "FINDING"
    | "REPORT"
    | "CLAIM";
};

export type EvidencePipelineItem = {
  id: string;
  file: string;
  caseNumber: string;
  status: EvidenceStatus;
  progress?: number;
};

/* =========================================================
   MOCK CURRENT USER

   Later this should come from authentication/session.
========================================================= */

export const currentUser = {
  name: "Jawad Sabbah",
  firstName: "Jawad",
  role: "Investigator",
};

/* =========================================================
   MOCK DATA
========================================================= */

export const recentCases: RecentCase[] = [
  {
    id: "1",

    caseNumber:
      "INV-2026-001",

    title:
      "Suspicious Payments Investigation",

    type:
      "Money Laundering",

    status:
      "OPEN",

    updatedAt:
      "12 min ago",
  },

  {
    id: "2",

    caseNumber:
      "INV-2026-002",

    title:
      "Offshore Transfers Review",

    type:
      "Compliance Review",

    status:
      "IN_REVIEW",

    updatedAt:
      "45 min ago",
  },

  {
    id: "3",

    caseNumber:
      "INV-2026-003",

    title:
      "Procurement Fraud Investigation",

    type:
      "Procurement Fraud",

    status:
      "OPEN",

    updatedAt:
      "2h ago",
  },

  {
    id: "4",

    caseNumber:
      "INV-2026-004",

    title:
      "Internal Asset Misappropriation",

    type:
      "Asset Misappropriation",

    status:
      "OPEN",

    updatedAt:
      "1d ago",
  },
];

export const attentionItems: AttentionItem[] = [
  {
    id:
      "attention-001",

    label:
      "Entities awaiting review",

    description:
      "AI-extracted entities require investigator confirmation.",

    count:
      7,

    href:
      "/cases/1/entities",

    tone:
      "warning",
  },

  {
    id:
      "attention-002",

    label:
      "Unverified claims",

    description:
      "Claims have not yet been reviewed against available evidence.",

    count:
      3,

    href:
      "/cases/1/claims",

    tone:
      "warning",
  },

  {
    id:
      "attention-003",

    label:
      "Open flags",

    description:
      "Potential investigative issues are waiting for review.",

    count:
      4,

    href:
      "/cases/1/flags",

    tone:
      "warning",
  },

  {
    id:
      "attention-004",

    label:
      "Draft findings",

    description:
      "Findings need verification before they can feed reports.",

    count:
      2,

    href:
      "/cases/1/findings",

    tone:
      "neutral",
  },

  {
    id:
      "attention-005",

    label:
      "Failed evidence processing",

    description:
      "One evidence item requires retry or error review.",

    count:
      1,

    href:
      "/cases/1/evidence",

    tone:
      "danger",
  },
];

export const activityItems: ActivityItem[] = [
  {
    id:
      "activity-001",

    title:
      "Evidence uploaded",

    description:
      "bank_statement.pdf added to INV-2026-001",

    time:
      "10 min ago",

    type:
      "EVIDENCE",
  },

  {
    id:
      "activity-002",

    title:
      "Finding verified",

    description:
      "Conflicting testimony regarding ACME relationship",

    time:
      "24 min ago",

    type:
      "FINDING",
  },

  {
    id:
      "activity-003",

    title:
      "Entity reviewed",

    description:
      "John Smith confirmed as a Person entity",

    time:
      "38 min ago",

    type:
      "ENTITY",
  },

  {
    id:
      "activity-004",

    title:
      "Report generated",

    description:
      "Investigation Report — Suspicious Payments",

    time:
      "1h ago",

    type:
      "REPORT",
  },

  {
    id:
      "activity-005",

    title:
      "Claim reviewed",

    description:
      "\"I never worked for ACME Ltd\" marked contradicted",

    time:
      "2h ago",

    type:
      "CLAIM",
  },
];

export const evidencePipeline: EvidencePipelineItem[] = [
  {
    id:
      "pipeline-001",

    file:
      "bank_statement.pdf",

    caseNumber:
      "INV-2026-001",

    status:
      "READY",

    progress:
      100,
  },

  {
    id:
      "pipeline-002",

    file:
      "email_archive.zip",

    caseNumber:
      "INV-2026-001",

    status:
      "PROCESSING",

    progress:
      68,
  },

  {
    id:
      "pipeline-003",

    file:
      "company_registry.pdf",

    caseNumber:
      "INV-2026-002",

    status:
      "QUEUED",

    progress:
      0,
  },

  {
    id:
      "pipeline-004",

    file:
      "transactions.csv",

    caseNumber:
      "INV-2026-003",

    status:
      "FAILED",
  },
];
