"use client";

import { useMemo, useState } from "react";


import {
  cases,
  initialConversations,
  type Conversation,
  type ChatMessage,
} from "@/data/mocks/ai";

import { buildMockResponse } from "@/lib/mock-ai-response";
import {currentTime, createConversationTitle} from "@/lib/ai-utils";

import {EmptyConversation} from "@/components/ai/empty-conversation";
import {MessageItem} from "@/components/ai/message-item";
import {ThinkingMessage} from "@/components/ai/thinking-message";


import {
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

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



