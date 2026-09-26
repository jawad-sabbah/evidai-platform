

export type EventReviewStatus =
  | "UNREVIEWED"
  | "CONFIRMED"
  | "REJECTED";

export type TimelineEvidence = {
  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

export type TimelineParticipant = {
  id: string;

  name: string;

  role: string;

  type: "PERSON" | "ORGANIZATION";
};

export type TimelineEvent = {
  id: string;

  eventType: string;

  title: string;

  description: string;

  date: string;

  time?: string;

  confidence: number;

  reviewStatus: EventReviewStatus;

  participants: TimelineParticipant[];

  evidence: TimelineEvidence[];
};

/* =========================================================
   MOCK DATA

   IMPORTANT:
   This timeline represents events extracted from ALL READY
   evidence belonging to the current case.
========================================================= */

export const events: TimelineEvent[] = [
  {
    id: "evt-001",

    eventType: "PAYMENT",

    title: "$100,000 transferred",

    description:
      "A $100,000 payment was transferred from an account associated with John Smith to ACME Ltd.",

    date: "2026-03-12",

    time: "14:28",

    confidence: 0.97,

    reviewStatus: "CONFIRMED",

    participants: [
      {
        id: "ent-001",

        name: "John Smith",

        role: "Sender",

        type: "PERSON",
      },

      {
        id: "ent-002",

        name: "ACME Ltd",

        role: "Recipient",

        type: "ORGANIZATION",
      },
    ],

    evidence: [
      {
        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 12,

        excerpt:
          "Transfer of $100,000 from Account 3281 to ACME Ltd.",
      },
    ],
  },

  {
    id: "evt-002",

    eventType: "COMMUNICATION",

    title: "Email communication",

    description:
      "John Smith exchanged email correspondence with Sarah Miller regarding payment scheduling.",

    date: "2026-03-14",

    time: "09:42",

    confidence: 0.93,

    reviewStatus: "CONFIRMED",

    participants: [
      {
        id: "ent-001",

        name: "John Smith",

        role: "Sender",

        type: "PERSON",
      },

      {
        id: "ent-005",

        name: "Sarah Miller",

        role: "Recipient",

        type: "PERSON",
      },
    ],

    evidence: [
      {
        evidenceId: "ev-008",

        file: "email_332.pdf",

        page: 2,

        excerpt:
          "Please send the revised payment schedule before Friday.",
      },
    ],
  },

  {
    id: "evt-003",

    eventType: "CORPORATE_CHANGE",

    title: "Company registration changed",

    description:
      "Corporate registry records indicate a change to ACME Ltd's registered information.",

    date: "2026-03-18",

    confidence: 0.91,

    reviewStatus: "UNREVIEWED",

    participants: [
      {
        id: "ent-002",

        name: "ACME Ltd",

        role: "Organization",

        type: "ORGANIZATION",
      },
    ],

    evidence: [
      {
        evidenceId: "ev-004",

        file: "registry.pdf",

        page: 7,

        excerpt:
          "Updated company registration information effective March 18.",
      },
    ],
  },

  {
    id: "evt-004",

    eventType: "PAYMENT",

    title: "Offshore payment",

    description:
      "ACME Ltd transferred funds to Global Holdings through an offshore account.",

    date: "2026-04-02",

    time: "11:15",

    confidence: 0.88,

    reviewStatus: "UNREVIEWED",

    participants: [
      {
        id: "ent-002",

        name: "ACME Ltd",

        role: "Sender",

        type: "ORGANIZATION",
      },

      {
        id: "ent-006",

        name: "Global Holdings",

        role: "Recipient",

        type: "ORGANIZATION",
      },
    ],

    evidence: [
      {
        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 24,

        excerpt:
          "International transfer from ACME Ltd to Global Holdings.",
      },
    ],
  },

  {
    id: "evt-005",

    eventType: "MEETING",

    title: "Meeting referenced",

    description:
      "Meeting notes reference a discussion between John Smith and ACME representatives.",

    date: "2026-04-07",

    confidence: 0.82,

    reviewStatus: "UNREVIEWED",

    participants: [
      {
        id: "ent-001",

        name: "John Smith",

        role: "Participant",

        type: "PERSON",
      },

      {
        id: "ent-002",

        name: "ACME Ltd",

        role: "Organization",

        type: "ORGANIZATION",
      },
    ],

    evidence: [
      {
        evidenceId: "ev-006",

        file: "meeting_notes.docx",

        page: 3,

        excerpt:
          "Meeting with John Smith regarding outstanding financial arrangements.",
      },
    ],
  },
];

export const eventTypes = [
  "ALL",
  "PAYMENT",
  "COMMUNICATION",
  "CORPORATE_CHANGE",
  "MEETING",
];