/* =========================================================
   TYPES
========================================================= */

export type ClaimStatus =
  | "UNVERIFIED"
  | "SUPPORTED"
  | "CONTRADICTED"
  | "DISPUTED"
  | "VERIFIED";

export type ClaimEvidenceType =
  | "SUPPORTS"
  | "CONTRADICTS";

export type ClaimEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;

  type: ClaimEvidenceType;
};

export type ClaimItem = {
  id: string;

  text: string;

  speaker: string;

  claimType: string;

  confidence: number;

  status: ClaimStatus;

  date: string;

  supportingCount: number;

  contradictingCount: number;

  evidence: ClaimEvidence[];

  reviewNotes?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

export const initialClaims: ClaimItem[] = [
  {
    id: "claim-001",

    text:
      "I never worked for ACME Ltd.",

    speaker:
      "John Smith",

    claimType:
      "Employment",

    confidence:
      0.94,

    status:
      "CONTRADICTED",

    date:
      "Mar 14, 2026",

    supportingCount:
      0,

    contradictingCount:
      2,

    evidence: [
      {
        id:
          "ce-001",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd.",

        type:
          "CONTRADICTS",
      },

      {
        id:
          "ce-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement identifies John Smith as acting on behalf of ACME Ltd.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-002",

    text:
      "The payment was for consulting services.",

    speaker:
      "Sarah Miller",

    claimType:
      "Payment Purpose",

    confidence:
      0.82,

    status:
      "DISPUTED",

    date:
      "Mar 16, 2026",

    supportingCount:
      1,

    contradictingCount:
      1,

    evidence: [
      {
        id:
          "ce-003",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          9,

        excerpt:
          "Consulting services are referenced in the agreement.",

        type:
          "SUPPORTS",
      },

      {
        id:
          "ce-004",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "The transfer description does not identify a consulting invoice or service reference.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-003",

    text:
      "I was not aware of this account.",

    speaker:
      "John Smith",

    claimType:
      "Account Knowledge",

    confidence:
      0.77,

    status:
      "UNVERIFIED",

    date:
      "Mar 18, 2026",

    supportingCount:
      0,

    contradictingCount:
      0,

    evidence: [
      {
        id:
          "ce-005",

        evidenceId:
          "ev-006",

        file:
          "interview_notes.pdf",

        page:
          5,

        excerpt:
          "John Smith stated that he was not aware of Account 3281.",

        type:
          "SUPPORTS",
      },
    ],
  },

  {
    id:
      "claim-004",

    text:
      "ACME Ltd had no offshore subsidiaries.",

    speaker:
      "ACME Ltd",

    claimType:
      "Corporate Structure",

    confidence:
      0.91,

    status:
      "CONTRADICTED",

    date:
      "Apr 2, 2026",

    supportingCount:
      0,

    contradictingCount:
      1,

    evidence: [
      {
        id:
          "ce-006",

        evidenceId:
          "ev-011",

        file:
          "offshore_registry.pdf",

        page:
          4,

        excerpt:
          "Registry records identify Global Holdings as an offshore subsidiary linked to ACME Ltd.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-005",

    text:
      "All payments were properly authorized.",

    speaker:
      "Sarah Miller",

    claimType:
      "Authorization",

    confidence:
      0.85,

    status:
      "SUPPORTED",

    date:
      "Apr 4, 2026",

    supportingCount:
      1,

    contradictingCount:
      0,

    evidence: [
      {
        id:
          "ce-007",

        evidenceId:
          "ev-012",

        file:
          "approval_email.pdf",

        page:
          2,

        excerpt:
          "Email approval recorded before the payment date.",

        type:
          "SUPPORTS",
      },
    ],
  },
];

export const statusOptions: Array<
  "ALL" | ClaimStatus
> = [
  "ALL",
  "UNVERIFIED",
  "SUPPORTED",
  "CONTRADICTED",
  "DISPUTED",
  "VERIFIED",
];
