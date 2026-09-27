
/* =========================================================
   TYPES
========================================================= */

export type EntityType =
  | "PERSON"
  | "ORGANIZATION"
  | "BANK_ACCOUNT"
  | "EMAIL";

export type GraphEntity = {
  id: string;
  name: string;
  type: EntityType;
  confidence: number;
};

export type RelationshipEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

export type Relationship = {
  id: string;

  source: string;

  target: string;

  type: string;

  confidence: number;

  description: string;

  evidence: RelationshipEvidence[];
};

/* =========================================================
   ENTITIES MOCK DATA
========================================================= */

export const entities: GraphEntity[] = [
  {
    id: "john",
    name: "John Smith",
    type: "PERSON",
    confidence: 0.98,
  },

  {
    id: "acme",
    name: "ACME Ltd",
    type: "ORGANIZATION",
    confidence: 0.96,
  },

  {
    id: "account",
    name: "Account 3281",
    type: "BANK_ACCOUNT",
    confidence: 0.99,
  },

  {
    id: "sarah",
    name: "Sarah Miller",
    type: "PERSON",
    confidence: 0.94,
  },

  {
    id: "global",
    name: "Global Holdings",
    type: "ORGANIZATION",
    confidence: 0.89,
  },

  {
    id: "email",
    name: "john.smith@acme.com",
    type: "EMAIL",
    confidence: 0.97,
  },
];

/* =========================================================
   RELATIONSHIPS MOCK DATA

   Later:
   relationships table
        ↓
   relationship_evidence
        ↓
   evidence / page / chunk
========================================================= */

export const relationships: Relationship[] = [
  {
    id: "rel-1",

    source: "john",

    target: "acme",

    type: "DIRECTOR_OF",

    confidence: 0.96,

    description:
      "John Smith is identified as a director of ACME Ltd in corporate registry evidence.",

    evidence: [
      {
        id: "re-001",

        evidenceId: "ev-004",

        file: "company_registry.pdf",

        page: 7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd in the corporate registry.",
      },

      {
        id: "re-002",

        evidenceId: "ev-002",

        file: "contract_acme.pdf",

        page: 12,

        excerpt:
          "The agreement identifies John Smith as acting on behalf of ACME Ltd.",
      },

      {
        id: "re-003",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 4,

        excerpt:
          "Internal correspondence refers to John Smith as an ACME director.",
      },
    ],
  },

  {
    id: "rel-2",

    source: "john",

    target: "account",

    type: "CONTROLS",

    confidence: 0.92,

    description:
      "Evidence indicates John Smith exercises control over Account 3281.",

    evidence: [
      {
        id: "re-004",

        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 12,

        excerpt:
          "Account 3281 contains transactions authorized using credentials associated with John Smith.",
      },

      {
        id: "re-005",

        evidenceId: "ev-009",

        file: "account_opening.pdf",

        page: 3,

        excerpt:
          "John Smith is identified as an authorized account controller.",
      },

      {
        id: "re-006",

        evidenceId: "ev-011",

        file: "account_mandate.pdf",

        page: 5,

        excerpt:
          "The account mandate identifies John Smith as an authorized signatory.",
      },

      {
        id: "re-007",

        evidenceId: "ev-012",

        file: "authorization_email.pdf",

        page: 2,

        excerpt:
          "Email correspondence confirms authorization for transactions from Account 3281.",
      },
    ],
  },

  {
    id: "rel-3",

    source: "john",

    target: "sarah",

    type: "EMAILED",

    confidence: 0.89,

    description:
      "Email evidence shows direct communication between John Smith and Sarah Miller.",

    evidence: [
      {
        id: "re-008",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 2,

        excerpt:
          "Email correspondence between John Smith and Sarah Miller regarding payment scheduling.",
      },

      {
        id: "re-009",

        evidenceId: "ev-010",

        file: "mail_archive.pdf",

        page: 18,

        excerpt:
          "Additional correspondence between John Smith and Sarah Miller was identified.",
      },
    ],
  },

  {
    id: "rel-4",

    source: "acme",

    target: "global",

    type: "TRANSFERRED_TO",

    confidence: 0.93,

    description:
      "Financial evidence identifies transfers from ACME Ltd to Global Holdings.",

    evidence: [
      {
        id: "re-010",

        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 24,

        excerpt:
          "International transfer from ACME Ltd to Global Holdings.",
      },

      {
        id: "re-011",

        evidenceId: "ev-003",

        file: "transactions.csv",

        page: 1,

        excerpt:
          "Transaction export records Global Holdings as the receiving party.",
      },
    ],
  },

  {
    id: "rel-5",

    source: "john",

    target: "email",

    type: "USES",

    confidence: 0.98,

    description:
      "The email address is attributed to John Smith across multiple documents.",

    evidence: [
      {
        id: "re-012",

        evidenceId: "ev-004",

        file: "company_registry.pdf",

        page: 8,

        excerpt:
          "john.smith@acme.com is listed as the contact email for John Smith.",
      },

      {
        id: "re-013",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 1,

        excerpt:
          "Messages were sent from john.smith@acme.com under the name John Smith.",
      },
    ],
  },
];

/* =========================================================
   GRAPH POSITIONS
========================================================= */

export const positions: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  john: {
    x: 420,
    y: 230,
  },

  acme: {
    x: 420,
    y: 30,
  },

  account: {
    x: 110,
    y: 410,
  },

  sarah: {
    x: 720,
    y: 410,
  },

  global: {
    x: 720,
    y: 70,
  },

  email: {
    x: 100,
    y: 100,
  },
};
