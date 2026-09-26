
/* =========================================================
   TYPES
========================================================= */

export type FlagSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type FlagStatus =
  | "OPEN"
  | "REVIEWED"
  | "DISMISSED"
  | "CONVERTED";

export type FlagEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

export type FlagItem = {
  id: string;

  title: string;

  description: string;

  detectionType: string;

  severity: FlagSeverity;

  status: FlagStatus;

  confidence: number;

  createdAt: string;

  evidence: FlagEvidence[];

  reviewNotes?: string;

  findingId?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

export const initialFlags: FlagItem[] = [
  {
    id: "flag-001",

    title:
      "Possible undisclosed ownership relationship",

    description:
      "Evidence suggests John Smith may have an undisclosed ownership or control relationship with ACME Ltd.",

    detectionType:
      "Undisclosed Relationship",

    severity:
      "CRITICAL",

    status:
      "OPEN",

    confidence:
      0.94,

    createdAt:
      "Mar 18, 2026",

    evidence: [
      {
        id:
          "fe-001",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith appears as a listed director of ACME Ltd.",
      },

      {
        id:
          "fe-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement references control rights associated with John Smith.",
      },

      {
        id:
          "fe-003",

        evidenceId:
          "ev-008",

        file:
          "email_thread.pdf",

        page:
          4,

        excerpt:
          "Internal correspondence refers to John Smith as controlling ACME operations.",
      },
    ],
  },

  {
    id: "flag-002",

    title:
      "Unusual payment pattern",

    description:
      "Multiple high-value transfers appear clustered around company registration changes.",

    detectionType:
      "Unusual Payment Pattern",

    severity:
      "HIGH",

    status:
      "OPEN",

    confidence:
      0.87,

    createdAt:
      "Mar 20, 2026",

    evidence: [
      {
        id:
          "fe-004",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "Several high-value payments were processed within a short period.",
      },

      {
        id:
          "fe-005",

        evidenceId:
          "ev-004",

        file:
          "registry.pdf",

        page:
          7,

        excerpt:
          "Corporate registration information changed during the same period.",
      },
    ],
  },

  {
    id: "flag-003",

    title:
      "Conflicting testimony",

    description:
      "John Smith's interview statement conflicts with corporate registry records.",

    detectionType:
      "Conflicting Statements",

    severity:
      "HIGH",

    status:
      "REVIEWED",

    confidence:
      0.91,

    createdAt:
      "Mar 21, 2026",

    reviewNotes:
      "Registry evidence confirms a conflict with the interview statement.",

    evidence: [
      {
        id:
          "fe-006",

        evidenceId:
          "ev-006",

        file:
          "interview_notes.pdf",

        page:
          5,

        excerpt:
          "John Smith stated that he had never worked for ACME Ltd.",
      },

      {
        id:
          "fe-007",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd.",
      },
    ],
  },

  {
    id: "flag-004",

    title:
      "Timeline inconsistency",

    description:
      "The stated payment authorization date occurs after the recorded transaction date.",

    detectionType:
      "Date Inconsistency",

    severity:
      "MEDIUM",

    status:
      "OPEN",

    confidence:
      0.79,

    createdAt:
      "Apr 2, 2026",

    evidence: [
      {
        id:
          "fe-008",

        evidenceId:
          "ev-012",

        file:
          "approval_email.pdf",

        page:
          2,

        excerpt:
          "Approval email timestamp is April 3.",
      },

      {
        id:
          "fe-009",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          24,

        excerpt:
          "Transaction was completed on April 2.",
      },
    ],
  },

  {
    id: "flag-005",

    title:
      "Missing payment documentation",

    description:
      "No contract or invoice was found for one of the reviewed payments.",

    detectionType:
      "Missing Documentation",

    severity:
      "LOW",

    status:
      "DISMISSED",

    confidence:
      0.73,

    createdAt:
      "Apr 4, 2026",

    reviewNotes:
      "Investigator determined the document existed under a different evidence record.",

    evidence: [
      {
        id:
          "fe-010",

        evidenceId:
          "ev-003",

        file:
          "transactions.csv",

        page:
          1,

        excerpt:
          "Payment entry initially appeared to have no linked invoice.",
      },
    ],
  },
];

/* =========================================================
   OPTIONS
========================================================= */

export const severityOptions: Array<
  "ALL" | FlagSeverity
> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

export const statusOptions: Array<
  "ALL" | FlagStatus
> = [
  "ALL",
  "OPEN",
  "REVIEWED",
  "DISMISSED",
  "CONVERTED",
];