
/* =========================================================
   TYPES
========================================================= */

export type ReviewStatus =
  | "UNREVIEWED"
  | "CONFIRMED"
  | "REJECTED"
  | "MERGED";

export type EntityType =
  | "PERSON"
  | "ORGANIZATION"
  | "BANK_ACCOUNT"
  | "LOCATION"
  | "EMAIL";

export type EntityItem = {
  id: string;

  entityType: EntityType;

  canonicalName: string;

  normalizedValue?: string;

  confidence: number;

  reviewStatus: ReviewStatus;

  mentions: number;

  lastSeen: string;

  reviewNotes?: string;

  mergedInto?: string;
};

/* =========================================================
   MOCK DATA
   Immediately after processing -> UNREVIEWED
========================================================= */

export const initialEntities: EntityItem[] = [
  {
    id: "ent-001",
    entityType: "PERSON",
    canonicalName: "John Smith",
    confidence: 0.98,
    reviewStatus: "UNREVIEWED",
    mentions: 21,
    lastSeen: "2h ago",
  },

  {
    id: "ent-002",
    entityType: "ORGANIZATION",
    canonicalName: "ACME Ltd",
    confidence: 0.96,
    reviewStatus: "UNREVIEWED",
    mentions: 16,
    lastSeen: "4h ago",
  },

  {
    id: "ent-003",
    entityType: "BANK_ACCOUNT",
    canonicalName: "Account 3281",
    normalizedValue: "LB2300013281",
    confidence: 0.99,
    reviewStatus: "UNREVIEWED",
    mentions: 8,
    lastSeen: "1d ago",
  },

  {
    id: "ent-004",
    entityType: "LOCATION",
    canonicalName: "London",
    confidence: 0.91,
    reviewStatus: "MERGED",
    mentions: 4,
    lastSeen: "1d ago",
  },

  {
    id: "ent-005",
    entityType: "PERSON",
    canonicalName: "Sarah Miller",
    confidence: 0.94,
    reviewStatus: "CONFIRMED",
    mentions: 12,
    lastSeen: "2d ago",
  },

  {
    id: "ent-006",
    entityType: "ORGANIZATION",
    canonicalName: "Global Holdings",
    confidence: 0.89,
    reviewStatus: "REJECTED",
    mentions: 6,
    lastSeen: "2d ago",
  },

  {
    id: "ent-007",
    entityType: "EMAIL",
    canonicalName: "john.smith@acme.com",
    confidence: 0.97,
    reviewStatus: "CONFIRMED",
    mentions: 9,
    lastSeen: "3d ago",
  },
];

export const entityTypes: Array<"ALL" | EntityType> = [
  "ALL",
  "PERSON",
  "ORGANIZATION",
  "BANK_ACCOUNT",
  "LOCATION",
  "EMAIL",
];

export const reviewStatuses: Array<
  "ALL" | ReviewStatus
> = [
  "ALL",
  "UNREVIEWED",
  "CONFIRMED",
  "REJECTED",
  "MERGED",
];




export const mentions = [
  {
    id: "m1",
    file: "company_registry.pdf",
    page: 7,
    text: "John Smith was appointed director of ACME Ltd.",
  },
  {
    id: "m2",
    file: "email_332.pdf",
    page: 2,
    text: "John requested an updated payment schedule.",
  },
  {
    id: "m3",
    file: "bank_statement.pdf",
    page: 12,
    text: "Transfer reference includes John Smith.",
  },
  {
    id: "m4",
    file: "interview.pdf",
    page: 3,
    text: "John denied being directly involved with ACME.",
  },
];

export const relationships = [
  {
    id: "r1",
    type: "DIRECTOR_OF",
    target: "ACME Ltd",
    confidence: 0.96,
  },
  {
    id: "r2",
    type: "CONTROLS",
    target: "Account 3281",
    confidence: 0.92,
  },
  {
    id: "r3",
    type: "EMAILED",
    target: "Sarah Miller",
    confidence: 0.89,
  },
];

export const events = [
  {
    id: "e1",
    date: "Mar 12, 2026",
    title: "$100,000 transfer",
  },
  {
    id: "e2",
    date: "Mar 14, 2026",
    title: "Email communication",
  },
  {
    id: "e3",
    date: "Mar 18, 2026",
    title: "Company registry updated",
  },
];
