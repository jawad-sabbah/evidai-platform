export type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
  status: "OPEN" | "IN_REVIEW" | "CLOSED" | "ARCHIVED";
};

export type Citation = {
  id: string;
  evidenceId: string;
  file: string;
  page: number;
  excerpt: string;
};

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

export type Conversation = {
  id: string;
  caseId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};


export const cases: CaseOption[] = [
  {
    id: "1",
    caseNumber: "INV-2026-001",
    title: "Suspicious Payments Investigation",
    status: "OPEN",
  },
  {
    id: "2",
    caseNumber: "INV-2026-002",
    title: "Offshore Transfers Review",
    status: "IN_REVIEW",
  },
  {
    id: "3",
    caseNumber: "INV-2026-003",
    title: "Procurement Fraud Investigation",
    status: "OPEN",
  },
];


export const initialConversations: Conversation[] = [
  {
    id: "conv-001",
    caseId: "1",
    title: "Ownership relationship",
    createdAt: "Sep 24, 2026",
    updatedAt: "2 min ago",

    messages: [
      {
        id: "msg-001",
        role: "USER",
        content:
          "How is John Smith connected to ACME Ltd?",
        createdAt: "12:30",
      },

      {
        id: "msg-002",
        role: "ASSISTANT",
        content:
          "The current case evidence indicates that John Smith is connected to ACME Ltd through a documented corporate role. Corporate registry evidence identifies him as a director, while a contract also references him as acting on behalf of the company. The relationship is supported by multiple evidence sources in this investigation.",
        createdAt: "12:30",

        citations: [
          {
            id: "cit-001",
            evidenceId: "ev-004",
            file: "company_registry.pdf",
            page: 7,
            excerpt:
              "John Smith is listed as a director of ACME Ltd.",
          },

          {
            id: "cit-002",
            evidenceId: "ev-002",
            file: "contract_acme.pdf",
            page: 12,
            excerpt:
              "The agreement identifies John Smith as acting on behalf of ACME Ltd.",
          },
        ],
      },
    ],
  },

  {
    id: "conv-002",
    caseId: "1",
    title: "Payment analysis",
    createdAt: "Sep 24, 2026",
    updatedAt: "20 min ago",
    messages: [],
  },

  {
    id: "conv-003",
    caseId: "1",
    title: "Timeline review",
    createdAt: "Sep 23, 2026",
    updatedAt: "1d ago",
    messages: [],
  },

  {
    id: "conv-004",
    caseId: "2",
    title: "Offshore entities",
    createdAt: "Sep 22, 2026",
    updatedAt: "2d ago",
    messages: [],
  },
];



export const  suggestedQuestions = [
  "How is John Smith connected to ACME Ltd?",
  "What are the most significant payment patterns?",
  "Which claims are contradicted by evidence?",
  "Show me the timeline around the offshore payment.",
  "Which findings have been verified?",
  "Which entities are connected to Global Holdings?",
];