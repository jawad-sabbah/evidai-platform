/* =========================================================
   TYPES
========================================================= */

export type ReportStatus =
  | "GENERATING"
  | "DRAFT"
  | "FINAL"
  | "FAILED";

export type ReportType =
  | "FULL"
  | "EXECUTIVE"
  | "INTERIM"
  | "FINDINGS";

export type FindingSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type VerifiedFinding = {
  id: string;

  title: string;

  description: string;

  severity: FindingSeverity;
};

export type ReportCitation = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  quotedText: string;
};

export type ReportSection = {
  id: string;

  title: string;

  sectionType: string;

  order: number;

  content: string;

  citations: ReportCitation[];
};

export type ReportItem = {
  id: string;

  title: string;

  reportType: ReportType;

  status: ReportStatus;

  generatedBy: string;

  generatedAt?: string;

  finalizedBy?: string;

  finalizedAt?: string;

  findingIds: string[];

  sections: ReportSection[];
};

/* =========================================================
   VERIFIED FINDINGS

   Later:
   GET /cases/{caseId}/findings?status=VERIFIED
========================================================= */

export const verifiedFindings: VerifiedFinding[] = [
  {
    id: "finding-001",

    title:
      "Undisclosed ownership relationship with ACME Ltd",

    description:
      "Evidence indicates that John Smith maintained a significant control relationship with ACME Ltd.",

    severity: "CRITICAL",
  },

  {
    id: "finding-003",

    title:
      "Interview statement conflicts with registry evidence",

    description:
      "John Smith denied working for ACME Ltd while registry evidence identifies him as a director.",

    severity: "HIGH",
  },

  {
    id: "finding-005",

    title:
      "High-value transfers require additional explanation",

    description:
      "Multiple high-value transfers occurred without sufficient supporting documentation.",

    severity: "HIGH",
  },
];

/* =========================================================
   INITIAL REPORTS
========================================================= */

export const initialReports: ReportItem[] = [
  {
    id: "report-001",

    title:
      "Investigation Report — Suspicious Payments",

    reportType: "FULL",

    status: "DRAFT",

    generatedBy: "Jawad Sabbah",

    generatedAt: "Sep 20, 2026",

    findingIds: [
      "finding-001",
      "finding-003",
    ],

    sections: [
      {
        id: "section-001",

        title:
          "Executive Summary",

        sectionType:
          "EXECUTIVE_SUMMARY",

        order: 1,

        content:
          "The investigation identified potentially significant financial activity, corporate relationships, and inconsistencies requiring further investigative review.",

        citations: [
          {
            id: "citation-001",

            evidenceId:
              "ev-004",

            file:
              "company_registry.pdf",

            page: 7,

            quotedText:
              "John Smith appears as a listed director of ACME Ltd.",
          },
        ],
      },

      {
        id: "section-002",

        title:
          "Investigation Scope",

        sectionType:
          "SCOPE",

        order: 2,

        content:
          "The investigation reviewed financial records, company registry documents, contracts, communications, extracted entities, relationships, events, and verified findings related to the case.",

        citations: [],
      },

      {
        id: "section-003",

        title:
          "Verified Findings",

        sectionType:
          "FINDINGS",

        order: 3,

        content:
          "The investigation identified an undisclosed corporate relationship involving John Smith and ACME Ltd. Additional inconsistencies were identified between statements made during interviews and available corporate registry evidence.",

        citations: [
          {
            id: "citation-002",

            evidenceId:
              "ev-002",

            file:
              "contract_acme.pdf",

            page: 12,

            quotedText:
              "Agreement references ownership and control rights.",
          },

          {
            id: "citation-003",

            evidenceId:
              "ev-004",

            file:
              "company_registry.pdf",

            page: 7,

            quotedText:
              "John Smith appears as a listed director of ACME Ltd.",
          },
        ],
      },

      {
        id: "section-004",

        title: "Conclusion",

        sectionType:
          "CONCLUSION",

        order: 4,

        content:
          "The verified findings and supporting evidence should be considered together with the complete investigation record before further investigative or procedural action is taken.",

        citations: [],
      },
    ],
  },

  {
    id: "report-002",

    title:
      "Interim Investigation Summary",

    reportType:
      "INTERIM",

    status: "FINAL",

    generatedBy:
      "Alex Morgan",

    generatedAt:
      "Sep 15, 2026",

    finalizedBy:
      "Sarah Reed",

    finalizedAt:
      "Sep 16, 2026",

    findingIds: [
      "finding-001",
    ],

    sections: [
      {
        id: "section-005",

        title: "Summary",

        sectionType:
          "SUMMARY",

        order: 1,

        content:
          "This interim report summarizes the first phase of the investigation and the reviewed evidence available at that stage.",

        citations: [],
      },
    ],
  },
];
