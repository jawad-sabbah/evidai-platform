"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

/* =========================================================
   TYPES
========================================================= */

type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
  status: "OPEN" | "IN_REVIEW" | "CLOSED" | "ARCHIVED";
};

type Citation = {
  id: string;
  evidenceId: string;
  file: string;
  page: number;
  excerpt: string;
};

type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  createdAt: string;
};

type Conversation = {
  id: string;
  caseId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

/* =========================================================
   MOCK CASES

   Later:
   GET /cases
========================================================= */

const cases: CaseOption[] = [
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

/* =========================================================
   MOCK CONVERSATIONS
========================================================= */

const initialConversations: Conversation[] = [
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

/* =========================================================
   SUGGESTED QUESTIONS
========================================================= */

const suggestedQuestions = [
  "How is John Smith connected to ACME Ltd?",
  "What are the most significant payment patterns?",
  "Which claims are contradicted by evidence?",
  "Show me the timeline around the offshore payment.",
  "Which findings have been verified?",
  "Which entities are connected to Global Holdings?",
];

/* =========================================================
   PAGE
========================================================= */

export default function AIPage() {
  const [selectedCaseId, setSelectedCaseId] =
    useState(cases[0].id);

  const [caseOpen, setCaseOpen] =
    useState(false);

  const [conversations, setConversations] =
    useState<Conversation[]>(
      initialConversations,
    );

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] =
    useState<string | null>(
      initialConversations[0]?.id ??
        null,
    );

  const [
    conversationSearch,
    setConversationSearch,
  ] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [isThinking, setIsThinking] =
    useState(false);

  /* =========================================================
     SELECTED CASE
  ========================================================= */

  const selectedCase =
    cases.find(
      (item) =>
        item.id ===
        selectedCaseId,
    ) ?? cases[0];

  /* =========================================================
     CASE CONVERSATIONS
  ========================================================= */

  const caseConversations =
    useMemo(() => {
      return conversations.filter(
        (conversation) =>
          conversation.caseId ===
          selectedCaseId,
      );
    }, [
      conversations,
      selectedCaseId,
    ]);

  /* =========================================================
     FILTER CONVERSATIONS
  ========================================================= */

  const filteredConversations =
    useMemo(() => {
      const searchValue =
        conversationSearch
          .toLowerCase()
          .trim();

      return caseConversations.filter(
        (conversation) =>
          conversation.title
            .toLowerCase()
            .includes(
              searchValue,
            ),
      );
    }, [
      caseConversations,
      conversationSearch,
    ]);

  /* =========================================================
     SELECTED CONVERSATION
  ========================================================= */

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId &&
        conversation.caseId ===
        selectedCaseId,
    ) ?? null;

  /* =========================================================
     CHANGE CASE
  ========================================================= */

  function changeCase(
    caseId: string,
  ) {
    setSelectedCaseId(caseId);

    setCaseOpen(false);

    setQuery("");

    const firstConversation =
      conversations.find(
        (conversation) =>
          conversation.caseId ===
          caseId,
      );

    setSelectedConversationId(
      firstConversation?.id ?? null,
    );
  }

  /* =========================================================
     NEW CONVERSATION
  ========================================================= */

  function createConversation() {
    const id =
      `conv-${Date.now()}`;

    const newConversation: Conversation =
      {
        id,
        caseId:
          selectedCaseId,
        title:
          "New investigation",
        createdAt:
          "Just now",
        updatedAt:
          "Just now",
        messages: [],
      };

    setConversations(
      (current) => [
        newConversation,
        ...current,
      ],
    );

    setSelectedConversationId(
      id,
    );

    setQuery("");
  }

  /* =========================================================
     SEND QUESTION
  ========================================================= */

  function sendQuestion(
    question?: string,
  ) {
    if (isThinking) {
      return;
    }

    const text =
      (question ?? query).trim();

    if (!text) {
      return;
    }

    let conversationId =
      selectedConversationId;

    /* Create conversation if none exists */

    if (!conversationId) {
      conversationId =
        `conv-${Date.now()}`;

      const newConversation: Conversation =
        {
          id:
            conversationId,

          caseId:
            selectedCaseId,

          title:
            createConversationTitle(
              text,
            ),

          createdAt:
            "Just now",

          updatedAt:
            "Just now",

          messages: [],
        };

      setConversations(
        (current) => [
          newConversation,
          ...current,
        ],
      );

      setSelectedConversationId(
        conversationId,
      );
    }

    const userMessage: ChatMessage =
      {
        id:
          `msg-${Date.now()}-user`,

        role:
          "USER",

        content:
          text,

        createdAt:
          currentTime(),
      };

    setConversations(
      (current) =>
        current.map(
          (conversation) => {
            if (
              conversation.id !==
              conversationId
            ) {
              return conversation;
            }

            return {
              ...conversation,

              title:
                conversation
                  .messages
                  .length === 0
                  ? createConversationTitle(
                      text,
                    )
                  : conversation.title,

              updatedAt:
                "Just now",

              messages: [
                ...conversation.messages,
                userMessage,
              ],
            };
          },
        ),
    );

    setQuery("");

    setIsThinking(true);

    /*
      FRONTEND MOCK

      Later backend:

      POST /cases/{caseId}/ai/query

      {
        conversationId,
        question
      }

      Backend should:
      1. search case-scoped chunks
      2. retrieve structured case intelligence
      3. generate grounded answer
      4. return citations
    */

    setTimeout(() => {
      const response =
        buildMockResponse(text);

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,

                    updatedAt:
                      "Just now",

                    messages: [
                      ...conversation.messages,

                      {
                        id:
                          `msg-${Date.now()}-assistant`,

                        role:
                          "ASSISTANT",

                        content:
                          response.content,

                        citations:
                          response.citations,

                        createdAt:
                          currentTime(),
                      },
                    ],
                  }
                : conversation,
          ),
      );

      setIsThinking(false);
    }, 1400);
  }

  return (
    <AppShell showTopbar={false}>
      <div className="flex h-full flex-col overflow-hidden bg-[#F7F7F3]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-[#E4E7E2] bg-[#F7F7F3] px-8 py-6">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A]">
                  <Sparkles
                    size={18}
                  />
                </div>

                <div>
                  <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                    AI Investigator
                  </h1>

                  <p className="mt-1 text-sm text-[#7A8580]">
                    Ask questions
                    across case evidence
                    and investigation
                    intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* CASE SELECTOR */}

            <div className="relative z-[100]">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                Active Case
              </div>

              <button
                type="button"
                onClick={() =>
                  setCaseOpen(
                    (open) => !open,
                  )
                }
                className="flex min-w-[320px] items-center justify-between gap-4 rounded-xl border border-[#DDE2DD] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#B8C7BF]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F4C3A]">
                    {
                      selectedCase.caseNumber
                    }
                  </div>

                  <div className="mt-1 truncate text-sm font-medium text-[#303C36]">
                    {
                      selectedCase.title
                    }
                  </div>
                </div>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-[#748079] transition-transform ${
                    caseOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {caseOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[999] w-[380px] overflow-hidden rounded-xl border border-[#DFE3DE] bg-white p-1.5 shadow-[0_16px_40px_rgba(25,35,30,0.15)]">
                  {cases.map(
                    (caseItem) => {
                      const selected =
                        selectedCaseId ===
                        caseItem.id;

                      return (
                        <button
                          key={
                            caseItem.id
                          }
                          type="button"
                          onClick={() =>
                            changeCase(
                              caseItem.id,
                            )
                          }
                          className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left transition ${
                            selected
                              ? "bg-[#EEF3F0]"
                              : "hover:bg-[#F5F6F2]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div
                              className={`text-xs font-semibold ${
                                selected
                                  ? "text-[#0F4C3A]"
                                  : "text-[#53605A]"
                              }`}
                            >
                              {
                                caseItem.caseNumber
                              }
                            </div>

                            <div className="mt-1 truncate text-sm text-[#34413B]">
                              {
                                caseItem.title
                              }
                            </div>
                          </div>

                          {selected && (
                            <Check
                              size={15}
                              className="shrink-0 text-[#0F4C3A]"
                            />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 py-6">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[290px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.05)]">
            {/* =============================================
                CONVERSATIONS
            ============================================= */}

            <aside className="flex min-h-0 flex-col border-r border-[#E6E8E4] bg-[#FAFAF7]">
              {/* NEW CONVERSATION */}

              <div className="shrink-0 border-b border-[#E6E8E4] p-4">
                <button
                  type="button"
                  onClick={
                    createConversation
                  }
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
                >
                  <Plus size={15} />

                  New conversation
                </button>

                {/* SEARCH */}

                <div className="relative mt-3">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929B96]"
                  />

                  <input
                    value={
                      conversationSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setConversationSearch(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Search conversations..."
                    className="h-9 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#A2AAA6] focus:border-[#98ADA2]"
                  />
                </div>
              </div>

              {/* CONVERSATION LIST */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="px-4 py-4">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#929A96]">
                    Conversations
                  </div>

                  {filteredConversations.length >
                  0 ? (
                    <div className="space-y-1">
                      {filteredConversations.map(
                        (
                          conversation,
                        ) => {
                          const selected =
                            selectedConversationId ===
                            conversation.id;

                          return (
                            <button
                              key={
                                conversation.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedConversationId(
                                  conversation.id,
                                )
                              }
                              className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition ${
                                selected
                                  ? "bg-white shadow-sm ring-1 ring-[#E3E7E3]"
                                  : "hover:bg-white/70"
                              }`}
                            >
                              <MessageSquare
                                size={
                                  15
                                }
                                className={`mt-0.5 shrink-0 ${
                                  selected
                                    ? "text-[#0F4C3A]"
                                    : "text-[#8B9490]"
                                }`}
                              />

                              <div className="min-w-0 flex-1">
                                <div
                                  className={`truncate text-xs font-medium ${
                                    selected
                                      ? "text-[#26312C]"
                                      : "text-[#59645F]"
                                  }`}
                                >
                                  {
                                    conversation.title
                                  }
                                </div>

                                <div className="mt-1 text-[10px] text-[#9AA29E]">
                                  {
                                    conversation.updatedAt
                                  }
                                </div>
                              </div>

                              {selected && (
                                <ChevronRight
                                  size={
                                    13
                                  }
                                  className="mt-0.5 shrink-0 text-[#0F4C3A]"
                                />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-10 text-center">
                      <MessageSquare
                        size={21}
                        className="mx-auto text-[#A3ABA7]"
                      />

                      <div className="mt-3 text-xs font-medium text-[#65716B]">
                        No conversations
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-[#9AA29E]">
                        Start a new
                        investigation
                        conversation.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CASE SCOPE */}

              <div className="shrink-0 border-t border-[#E6E8E4] p-4">
                <div className="rounded-xl border border-[#E2E7E3] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={14}
                      className="text-[#0F4C3A]"
                    />

                    <div className="text-xs font-semibold text-[#435049]">
                      Case scoped
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] leading-5 text-[#7E8883]">
                    Answers use evidence
                    and intelligence
                    associated with{" "}
                    <span className="font-medium text-[#4A5650]">
                      {
                        selectedCase.caseNumber
                      }
                    </span>
                    .
                  </p>
                </div>
              </div>
            </aside>

            {/* =============================================
                CHAT AREA
            ============================================= */}

            <main className="flex min-h-0 flex-col bg-white">
              {/* CHAT HEADER */}

              <div className="shrink-0 border-b border-[#ECEDE9] px-6 py-4">
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <div className="text-sm font-semibold text-[#29342F]">
                      {selectedConversation
                        ? selectedConversation.title
                        : "New investigation"}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#929A96]">
                      <span>
                        {
                          selectedCase.caseNumber
                        }
                      </span>

                      <span>•</span>

                      <span>
                        Evidence-grounded
                        conversation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-[#E2E7E3] bg-[#F6F8F5] px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-[#4D8B73]" />

                    <span className="text-[11px] font-medium text-[#557067]">
                      Case context
                      active
                    </span>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {selectedConversation &&
                selectedConversation
                  .messages.length >
                  0 ? (
                  <div className="mx-auto max-w-[900px] px-8 py-8">
                    <div className="space-y-8">
                      {selectedConversation.messages.map(
                        (
                          message,
                        ) => (
                          <MessageItem
                            key={
                              message.id
                            }
                            message={
                              message
                            }
                            caseId={
                              selectedCaseId
                            }
                          />
                        ),
                      )}

                      {isThinking && (
                        <ThinkingMessage />
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyConversation
                    caseNumber={
                      selectedCase.caseNumber
                    }
                    onQuestion={
                      sendQuestion
                    }
                  />
                )}
              </div>

              {/* INPUT */}

              <div className="shrink-0 border-t border-[#E7E9E5] bg-[#FCFCFA] px-7 py-5">
                <div className="mx-auto max-w-[900px]">
                  <div className="rounded-xl border border-[#DDE2DD] bg-white p-2 shadow-[0_3px_12px_rgba(28,40,34,0.04)] transition focus-within:border-[#9CB1A6]">
                    <textarea
                      value={query}
                      onChange={(
                        event,
                      ) =>
                        setQuery(
                          event.target
                            .value,
                        )
                      }
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          sendQuestion();
                        }
                      }}
                      rows={2}
                      placeholder="Ask a question about this investigation..."
                      className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-[#26312C] outline-none placeholder:text-[#9AA29E]"
                    />

                    <div className="flex items-center justify-between px-2 pb-1">
                      <div className="flex items-center gap-2 text-[10px] text-[#A0A7A3]">
                        <Sparkles
                          size={11}
                        />

                        Search evidence,
                        entities,
                        relationships,
                        events, claims and
                        findings
                      </div>

                      <button
                        type="button"
                        disabled={
                          !query.trim() ||
                          isThinking
                        }
                        onClick={() =>
                          sendQuestion()
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F4C3A] text-white transition hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send
                          size={14}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-center text-[10px] text-[#9AA29E]">
                    AI-generated analysis
                    should be verified
                    against cited source
                    evidence before
                    investigative action.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   EMPTY CONVERSATION
========================================================= */

function EmptyConversation({
  caseNumber,
  onQuestion,
}: {
  caseNumber: string;

  onQuestion: (
    question: string,
  ) => void;
}) {
  return (
    <div className="flex min-h-full items-center justify-center px-8 py-10">
      <div className="w-full max-w-[760px]">
        {/* ICON */}

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0EB] text-[#0F4C3A]">
          <Bot size={24} />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[#26312C]">
            Investigate the case
          </h2>

          <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#7A8580]">
            Ask EvidAI questions
            about evidence,
            entities,
            relationships,
            events, claims,
            flags and verified
            findings in{" "}
            <span className="font-medium text-[#4C5953]">
              {caseNumber}
            </span>
            .
          </p>
        </div>

        {/* SUGGESTIONS */}

        <div className="mt-8">
          <div className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.11em] text-[#929A96]">
            Suggested Questions
          </div>

          <div className="grid grid-cols-2 gap-3">
            {suggestedQuestions.map(
              (
                question,
              ) => (
                <button
                  key={
                    question
                  }
                  type="button"
                  onClick={() =>
                    onQuestion(
                      question,
                    )
                  }
                  className="group rounded-xl border border-[#E1E5E1] bg-[#FAFAF7] p-4 text-left transition hover:border-[#B9C8C0] hover:bg-[#F5F8F5]"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles
                      size={14}
                      className="mt-0.5 shrink-0 text-[#6D897C]"
                    />

                    <span className="text-xs font-medium leading-5 text-[#52605A] group-hover:text-[#0F4C3A]">
                      {
                        question
                      }
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* SCOPE */}

        <div className="mx-auto mt-7 max-w-[560px] rounded-xl border border-[#E2E7E3] bg-[#F6F8F5] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#0F4C3A]"
            />

            <div>
              <div className="text-xs font-semibold text-[#405048]">
                Evidence-grounded
                analysis
              </div>

              <p className="mt-1 text-xs leading-5 text-[#75817A]">
                Answers should
                distinguish extracted
                intelligence from
                human-reviewed findings
                and provide source
                citations whenever
                evidence supports the
                answer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MESSAGE ITEM
========================================================= */

function MessageItem({
  message,
  caseId,
}: {
  message: ChatMessage;

  caseId: string;
}) {
  const isUser =
    message.role ===
    "USER";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[680px]">
          <div className="flex items-start justify-end gap-3">
            <div>
              <div className="rounded-2xl rounded-tr-md bg-[#F0F3F0] px-5 py-3.5">
                <p className="text-sm leading-6 text-[#34413B]">
                  {
                    message.content
                  }
                </p>
              </div>

              <div className="mt-1.5 text-right text-[10px] text-[#A0A7A3]">
                {
                  message.createdAt
                }
              </div>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2ECE7] text-[#0F4C3A]">
              <User size={14} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* AI ICON */}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
        <Sparkles size={15} />
      </div>

      <div className="min-w-0 max-w-[760px] flex-1">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-[#2E3A34]">
            EvidAI
          </div>

          <div className="text-[10px] text-[#9AA29E]">
            {
              message.createdAt
            }
          </div>
        </div>

        {/* ANSWER */}

        <div className="mt-2 text-sm leading-7 text-[#53605A]">
          {
            message.content
          }
        </div>

        {/* SOURCES */}

        {message.citations &&
          message.citations
            .length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <FileText
                  size={13}
                  className="text-[#718079]"
                />

                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#87918C]">
                  Sources
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {message.citations.map(
                  (
                    citation,
                    index,
                  ) => (
                    <div
                      key={
                        citation.id
                      }
                      className="rounded-xl border border-[#E3E7E3] bg-[#FAFAF7] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E6EEE9] text-[10px] font-semibold text-[#0F4C3A]">
                          {
                            index +
                            1
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-[#435049]">
                            {
                              citation.file
                            }
                          </div>

                          <div className="mt-0.5 text-[10px] text-[#949C98]">
                            Page{" "}
                            {
                              citation.page
                            }
                          </div>
                        </div>

                        <Link
                          href={`/cases/${caseId}/evidence/${citation.evidenceId}?page=${citation.page}`}
                          className="shrink-0 text-xs font-medium text-[#0F4C3A] transition hover:underline"
                        >
                          Open Evidence
                        </Link>
                      </div>

                      <p className="mt-3 border-l-2 border-[#DCE5DF] pl-3 text-xs leading-5 text-[#78827D]">
                        &ldquo;
                        {
                          citation.excerpt
                        }
                        &rdquo;
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* GROUNDED LABEL */}

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#8B9490]">
          <ShieldCheck
            size={11}
          />

          Grounded in case
          evidence
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   THINKING
========================================================= */

function ThinkingMessage() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
        <Sparkles
          size={15}
          className="animate-pulse"
        />
      </div>

      <div className="rounded-xl border border-[#E5E8E4] bg-[#FAFAF7] px-4 py-3">
        <div className="flex items-center gap-2">
          <ThinkingDot delay="0ms" />
          <ThinkingDot delay="150ms" />
          <ThinkingDot delay="300ms" />

          <span className="ml-1 text-xs text-[#7C8781]">
            Searching case
            evidence…
          </span>
        </div>
      </div>
    </div>
  );
}

function ThinkingDot({
  delay,
}: {
  delay: string;
}) {
  return (
    <div
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7E958A]"
      style={{
        animationDelay:
          delay,
      }}
    />
  );
}

/* =========================================================
   MOCK RESPONSE ENGINE
========================================================= */

function buildMockResponse(
  question: string,
): {
  content: string;
  citations: Citation[];
} {
  const value =
    question.toLowerCase();

  /* JOHN / ACME */

  if (
    value.includes(
      "john smith",
    ) &&
    value.includes("acme")
  ) {
    return {
      content:
        "John Smith appears connected to ACME Ltd through a documented corporate role. Corporate registry evidence identifies him as a director, while a contract references him as acting on behalf of ACME Ltd. This connection is also represented in the case relationship graph as DIRECTOR_OF.",

      citations: [
        {
          id:
            createId(),

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
            createId(),

          evidenceId:
            "ev-002",

          file:
            "contract_acme.pdf",

          page:
            12,

          excerpt:
            "The agreement identifies John Smith as acting on behalf of ACME Ltd.",
        },
      ],
    };
  }

  /* PAYMENT */

  if (
    value.includes(
      "payment",
    ) ||
    value.includes(
      "transfer",
    )
  ) {
    return {
      content:
        "The case contains several high-value payment events. One documented transfer of $100,000 involved an account associated with John Smith and ACME Ltd. The investigation also contains a flag for an unusual payment pattern because multiple high-value transfers occurred within a short period.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            12,

          excerpt:
            "Transfer of $100,000 from Account 3281 to ACME Ltd.",
        },

        {
          id:
            createId(),

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
    };
  }

  /* CLAIMS */

  if (
    value.includes(
      "claim",
    ) ||
    value.includes(
      "contradict",
    )
  ) {
    return {
      content:
        "The case contains claims that conflict with documentary evidence. One notable example is John Smith's statement that he never worked for ACME Ltd. Corporate registry evidence identifies him as a director, so that claim is currently categorized as contradicted.",

      citations: [
        {
          id:
            createId(),

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
            createId(),

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
    };
  }

  /* TIMELINE */

  if (
    value.includes(
      "timeline",
    ) ||
    value.includes(
      "offshore",
    )
  ) {
    return {
      content:
        "The timeline shows a sequence of activity involving corporate changes and financial transfers. A high-value payment was recorded before a later authorization-related email, creating a timeline inconsistency that was flagged for investigator review.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            24,

          excerpt:
            "Transaction was completed on April 2.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-012",

          file:
            "approval_email.pdf",

          page:
            2,

          excerpt:
            "Approval email timestamp is April 3.",
        },
      ],
    };
  }

  /* FINDINGS */

  if (
    value.includes(
      "finding",
    ) ||
    value.includes(
      "verified",
    )
  ) {
    return {
      content:
        "The investigation contains reviewed findings derived from flags and supporting evidence. Verified findings are investigator-approved conclusions and are eligible to feed formal report generation. Draft or rejected findings should not be treated as verified conclusions.",

      citations: [
        {
          id:
            createId(),

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
    };
  }

  /* GLOBAL HOLDINGS */

  if (
    value.includes(
      "global holdings",
    )
  ) {
    return {
      content:
        "Global Holdings appears in the case as an organization connected to ACME Ltd through financial activity. The relationship graph includes a TRANSFERRED_TO connection from ACME Ltd to Global Holdings based on banking and transaction evidence.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            24,

          excerpt:
            "International transfer from ACME Ltd to Global Holdings.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-003",

          file:
            "transactions.csv",

          page:
            1,

          excerpt:
            "Transaction export records Global Holdings as the receiving party.",
        },
      ],
    };
  }

  /* FALLBACK */

  return {
    content:
      "I could not find enough mock case intelligence to answer that question confidently. In the backend version, EvidAI should search evidence chunks, entities, relationships, events, claims, flags and verified findings before generating a grounded answer.",

    citations: [],
  };
}

/* =========================================================
   HELPERS
========================================================= */

function createConversationTitle(
  question: string,
) {
  const cleaned =
    question.trim();

  if (
    cleaned.length <= 38
  ) {
    return cleaned;
  }

  return `${cleaned.slice(
    0,
    38,
  )}...`;
}

function currentTime() {
  return new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute:
        "2-digit",
    },
  );
}

function createId() {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}