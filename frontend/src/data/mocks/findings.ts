
/* =========================================================
   TYPES
========================================================= */

export type FindingStatus =
  | "DRAFT"
  | "VERIFIED"
  | "REJECTED";

export type FindingSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type FindingEvidence = {
  id: string;
  evidenceId: string;
  file: string;
  page: number;
  excerpt: string;
};

export type FindingItem = {
  id: string;

  title: string;

  description: string;

  severity: FindingSeverity;

  status: FindingStatus;

  confidence: number;

  createdBy: string;

  createdAt: string;

  sourceFlagId?: string;

  sourceFlagTitle?: string;

  evidence: FindingEvidence[];

  reviewNotes?: string;

  verifiedBy?: string;

  verifiedAt?: string;

  rejectedBy?: string;

  rejectedAt?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

export const initialFindings: FindingItem[] = [
  {
    id: "finding-001",

    title:
      "Possible undisclosed ownership relationship",

    description:
      "Evidence indicates that John Smith may have an undisclosed ownership or control relationship with ACME Ltd.",

    severity:
      "CRITICAL",

    status:
      "DRAFT",

    confidence:
      0.94,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Mar 23, 2026",

    sourceFlagId:
      "flag-001",

    sourceFlagTitle:
      "Possible undisclosed ownership relationship",

    evidence: [
      {
        id:
          "find-evidence-001",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd.",
      },

      {
        id:
          "find-evidence-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement references control rights associated with John Smith.",
      },
    ],
  },

  {
    id:
      "finding-002",

    title:
      "Unusual payment pattern",

    description:
      "Multiple high-value transfers occurred within a short period and appear associated with changes in corporate registration records.",

    severity:
      "HIGH",

    status:
      "DRAFT",

    confidence:
      0.87,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Mar 23, 2026",

    sourceFlagId:
      "flag-002",

    sourceFlagTitle:
      "Unusual payment pattern",

    evidence: [
      {
        id:
          "find-evidence-003",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "Transfer of $100,000 to ACME Ltd.",
      },

      {
        id:
          "find-evidence-004",

        evidenceId:
          "ev-003",

        file:
          "transactions.csv",

        page:
          1,

        excerpt:
          "Three high-value transfers occurred within five days.",
      },
    ],
  },

  {
    id:
      "finding-003",

    title:
      "Conflicting testimony regarding ACME relationship",

    description:
      "John Smith's interview statement conflicts with corporate registry evidence identifying him as a company director.",

    severity:
      "HIGH",

    status:
      "VERIFIED",

    confidence:
      0.91,

    createdBy:
      "Sarah Reed",

    createdAt:
      "Mar 24, 2026",

    verifiedBy:
      "Sarah Reed",

    verifiedAt:
      "Mar 25, 2026",

    reviewNotes:
      "Corporate registry records independently support the finding.",

    sourceFlagId:
      "flag-003",

    sourceFlagTitle:
      "Conflicting testimony",

    evidence: [
      {
        id:
          "find-evidence-005",

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
          "find-evidence-006",

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
    id:
      "finding-004",

    title:
      "Timeline inconsistency in payment authorization",

    description:
      "The stated payment authorization date occurs after the transaction was already recorded as completed.",

    severity:
      "MEDIUM",

    status:
      "REJECTED",

    confidence:
      0.79,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Apr 3, 2026",

    rejectedBy:
      "Sarah Reed",

    rejectedAt:
      "Apr 4, 2026",

    reviewNotes:
      "Additional evidence clarified that the approval email was a confirmation rather than the original authorization.",

    sourceFlagId:
      "flag-004",

    sourceFlagTitle:
      "Timeline inconsistency",

    evidence: [
      {
        id:
          "find-evidence-007",

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
          "find-evidence-008",

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
];

export const statusOptions: Array<
  "ALL" | FindingStatus
> = [
  "ALL",
  "DRAFT",
  "VERIFIED",
  "REJECTED",
];

export const severityOptions: Array<
  "ALL" | FindingSeverity
> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];
