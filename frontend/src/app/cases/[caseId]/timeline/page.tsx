"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Mail,
  Search,
  User,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type EventReviewStatus =
  | "UNREVIEWED"
  | "CONFIRMED"
  | "REJECTED";

type TimelineEvidence = {
  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

type TimelineParticipant = {
  id: string;

  name: string;

  role: string;

  type: "PERSON" | "ORGANIZATION";
};

type TimelineEvent = {
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

const events: TimelineEvent[] = [
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

const eventTypes = [
  "ALL",
  "PAYMENT",
  "COMMUNICATION",
  "CORPORATE_CHANGE",
  "MEETING",
];

/* =========================================================
   PAGE
========================================================= */

export default function TimelinePage() {
  const { caseId } = useParams<{
    caseId: string;
  }>();

  const [query, setQuery] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [typeOpen, setTypeOpen] =
    useState(false);

  const [
    selectedEvent,
    setSelectedEvent,
  ] =
    useState<TimelineEvent | null>(
      events[4],
    );

  /* =========================================================
     FILTER EVENTS
  ========================================================= */

  const filteredEvents =
    useMemo(() => {
      return events.filter(
        (event) => {
          const searchValue =
            query.toLowerCase();

          const matchesSearch =
            event.title
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            event.description
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            event.participants.some(
              (participant) =>
                participant.name
                  .toLowerCase()
                  .includes(
                    searchValue,
                  ),
            );

          const matchesType =
            typeFilter ===
              "ALL" ||
            event.eventType ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        },
      );
    }, [query, typeFilter]);

  /* =========================================================
     GROUP BY MONTH
  ========================================================= */

  const groupedEvents =
    useMemo(() => {
      const groups: Record<
        string,
        TimelineEvent[]
      > = {};

      filteredEvents.forEach(
        (event) => {
          const month =
            formatMonth(
              event.date,
            );

          if (!groups[month]) {
            groups[month] =
              [];
          }

          groups[month].push(
            event,
          );
        },
      );

      return groups;
    }, [filteredEvents]);

  return (
    <AppShell showTopbar={false}>
      <div className="flex h-full flex-col overflow-hidden bg-[#F7F7F3]">
        {/* =================================================
            CASE HEADER
        ================================================= */}

        <div className="shrink-0 px-8 pt-6">
          <div className="mx-auto max-w-[1380px]">
            <CaseWorkspaceHeader
              caseId={caseId}
              caseNumber="INV-2026-001"
              title="Suspicious Payments Investigation"
              status="OPEN"
            />
          </div>
        </div>

        {/* =================================================
            TIMELINE HEADER
        ================================================= */}

        <div className="shrink-0 px-8 py-5">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-6">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Timeline
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Review chronological
                events extracted from all
                processed evidence in this
                investigation.
              </p>
            </div>

            <div className="text-xs text-[#87918C]">
              {
                filteredEvents.length
              }{" "}
              {filteredEvents.length ===
              1
                ? "event"
                : "events"}
            </div>
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 pb-7">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[minmax(0,1fr)_340px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                LEFT TIMELINE
            ============================================= */}

            <section className="flex min-h-0 flex-col">
              {/* FILTER BAR */}

              <div className="shrink-0 border-b border-[#E6E8E4] bg-[#FAFAF7] px-6 py-4">
                <div className="relative z-[50] flex flex-wrap items-center gap-3 overflow-visible">
                  {/* SEARCH */}

                  <div className="relative min-w-[260px] flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929B96]"
                    />

                    <input
                      value={
                        query
                      }
                      onChange={(
                        event,
                      ) =>
                        setQuery(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Search timeline..."
                      className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                    />
                  </div>

                  {/* EVENT TYPE FILTER */}

                  <div className="relative z-[60]">
                    <button
                      type="button"
                      onClick={() =>
                        setTypeOpen(
                          (
                            open,
                          ) =>
                            !open,
                        )
                      }
                      className="flex h-10 min-w-[180px] items-center justify-between gap-4 rounded-lg border border-[#DFE3DE] bg-white px-4 text-sm text-[#59645F]"
                    >
                      {typeFilter ===
                      "ALL"
                        ? "All event types"
                        : formatLabel(
                            typeFilter,
                          )}

                      <ChevronDown
                        size={
                          15
                        }
                        className={`transition ${
                          typeOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {typeOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-[999] w-[210px] rounded-xl border border-[#E1E4DF] bg-white p-1.5 shadow-xl">
                        {eventTypes.map(
                          (
                            type,
                          ) => (
                            <button
                              key={
                                type
                              }
                              type="button"
                              onClick={() => {
                                setTypeFilter(
                                  type,
                                );

                                setTypeOpen(
                                  false,
                                );
                              }}
                              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                typeFilter ===
                                type
                                  ? "bg-[#EEF3F0] font-medium text-[#0F4C3A]"
                                  : "text-[#59645F] hover:bg-[#F3F5F1]"
                              }`}
                            >
                              {type ===
                              "ALL"
                                ? "All event types"
                                : formatLabel(
                                    type,
                                  )}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===========================================
                  TIMELINE
              =========================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
                {Object.keys(
                  groupedEvents,
                ).length >
                0 ? (
                  Object.entries(
                    groupedEvents,
                  ).map(
                    ([
                      month,
                      monthEvents,
                    ]) => (
                      <div
                        key={
                          month
                        }
                        className="mb-10 last:mb-0"
                      >
                        {/* MONTH */}

                        <div className="mb-5 flex items-center gap-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#68756E]">
                            {
                              month
                            }
                          </div>

                          <div className="h-px flex-1 bg-[#E8EAE7]" />
                        </div>

                        {/* EVENTS */}

                        <div className="relative">
                          <div className="absolute bottom-3 left-[71px] top-3 w-px bg-[#DDE3DE]" />

                          <div className="space-y-2">
                            {monthEvents.map(
                              (
                                event,
                              ) => {
                                const selected =
                                  selectedEvent?.id ===
                                  event.id;

                                return (
                                  <button
                                    key={
                                      event.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      setSelectedEvent(
                                        event,
                                      )
                                    }
                                    className={`relative grid w-full grid-cols-[55px_34px_minmax(0,1fr)] gap-0 rounded-xl px-2 py-3 text-left transition ${
                                      selected
                                        ? "bg-[#F3F6F3]"
                                        : "hover:bg-[#FAFAF7]"
                                    }`}
                                  >
                                    {/* DATE */}

                                    <div className="pr-3 pt-1 text-right">
                                      <div className="text-[11px] font-semibold uppercase text-[#4E5B55]">
                                        {formatDay(
                                          event.date,
                                        )}
                                      </div>

                                      <div className="mt-0.5 text-[9px] uppercase text-[#9AA29E]">
                                        {formatShortMonth(
                                          event.date,
                                        )}
                                      </div>
                                    </div>

                                    {/* ICON */}

                                    <div className="relative flex justify-center">
                                      <div
                                        className={`relative z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white ${eventIconStyles(
                                          event.eventType,
                                        )}`}
                                      >
                                        <EventIcon
                                          type={
                                            event.eventType
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* EVENT CONTENT */}

                                    <div className="min-w-0 rounded-lg px-3 py-1">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold text-[#29342F]">
                                            {
                                              event.title
                                            }
                                          </div>

                                          {/* PARTICIPANTS */}

                                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7A8580]">
                                            {event.participants.map(
                                              (
                                                participant,
                                                index,
                                              ) => (
                                                <span
                                                  key={
                                                    participant.id
                                                  }
                                                >
                                                  {
                                                    participant.name
                                                  }

                                                  {index <
                                                    event
                                                      .participants
                                                      .length -
                                                      1 && (
                                                    <span className="ml-2 text-[#B0B6B2]">
                                                      →
                                                    </span>
                                                  )}
                                                </span>
                                              ),
                                            )}
                                          </div>

                                          {/* SOURCE */}

                                          {event
                                            .evidence[0] && (
                                            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#98A09C]">
                                              <FileText
                                                size={
                                                  12
                                                }
                                              />

                                              {
                                                event
                                                  .evidence[0]
                                                  .file
                                              }

                                              <span>
                                                ·
                                              </span>

                                              <span>
                                                Page{" "}
                                                {
                                                  event
                                                    .evidence[0]
                                                    .page
                                                }
                                              </span>

                                              {event.time && (
                                                <>
                                                  <span>
                                                    ·
                                                  </span>

                                                  <span>
                                                    {
                                                      event.time
                                                    }
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        <ReviewBadge
                                          status={
                                            event.reviewStatus
                                          }
                                        />
                                      </div>
                                    </div>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center text-center">
                    <div>
                      <CalendarDays
                        size={
                          28
                        }
                        className="mx-auto text-[#A3ABA7]"
                      />

                      <div className="mt-3 text-sm font-semibold text-[#44504A]">
                        No timeline
                        events found
                      </div>

                      <p className="mt-1 text-xs text-[#8C9590]">
                        Try changing
                        your search or
                        filters.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                RIGHT EVENT PANEL
            ============================================= */}

            <aside className="min-h-0 border-l border-[#E6E8E4] bg-[#FCFCFA]">
              {selectedEvent ? (
                <EventDetailPanel
                  event={
                    selectedEvent
                  }
                  caseId={
                    caseId
                  }
                  onClose={() =>
                    setSelectedEvent(
                      null,
                    )
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <CalendarDays
                      size={26}
                      className="mx-auto text-[#A4ACA8]"
                    />

                    <div className="mt-3 text-sm font-semibold text-[#44504A]">
                      Select an
                      event
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#8C9590]">
                      Choose a
                      timeline event
                      to inspect its
                      participants,
                      confidence and
                      source
                      evidence.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   EVENT DETAIL PANEL
========================================================= */

function EventDetailPanel({
  event,
  caseId,
  onClose,
}: {
  event: TimelineEvent;

  caseId: string;

  onClose: () => void;
}) {
  const primaryEvidence =
    event.evidence[0];

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="shrink-0 border-b border-[#E7E9E5] bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#8A938E]">
            Event Details
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${eventIconStyles(
              event.eventType,
            )}`}
          >
            <EventIcon
              type={
                event.eventType
              }
              size={17}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#26312C]">
              {event.title}
            </h3>

            <div className="mt-1 text-xs text-[#808A85]">
              {formatFullDate(
                event.date,
              )}

              {event.time &&
                ` · ${event.time}`}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* DESCRIPTION */}

        <SectionLabel label="Description" />

        <p className="mt-2 text-sm leading-6 text-[#626E68]">
          {
            event.description
          }
        </p>

        {/* PARTICIPANTS */}

        <div className="mt-7">
          <SectionLabel label="Participants" />

          <div className="mt-3 space-y-3">
            {event.participants.map(
              (
                participant,
              ) => (
                <div
                  key={
                    participant.id
                  }
                  className="flex items-center justify-between rounded-lg border border-[#E7E9E5] bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF3F0] text-[#0F4C3A]">
                      {participant.type ===
                      "PERSON" ? (
                        <User
                          size={
                            14
                          }
                        />
                      ) : (
                        <Building2
                          size={
                            14
                          }
                        />
                      )}
                    </div>

                    <span className="text-sm font-medium text-[#36413C]">
                      {
                        participant.name
                      }
                    </span>
                  </div>

                  <span className="text-xs text-[#8A938E]">
                    {
                      participant.role
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* CONFIDENCE */}

        <div className="mt-7">
          <SectionLabel label="Confidence" />

          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E7EBE7]">
              <div
                className="h-full rounded-full bg-[#4D8B73]"
                style={{
                  width: `${
                    event.confidence *
                    100
                  }%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-[#0F4C3A]">
              {Math.round(
                event.confidence *
                  100,
              )}
              %
            </span>
          </div>
        </div>

        {/* SUPPORTING EVIDENCE */}

        <div className="mt-7">
          <SectionLabel label="Supporting Evidence" />

          <div className="mt-3 space-y-3">
            {event.evidence.map(
              (
                evidence,
              ) => (
                <div
                  key={`${event.id}-${evidence.evidenceId}-${evidence.page}`}
                  className="rounded-lg border border-[#E5E8E4] bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      size={14}
                      className="text-[#0F4C3A]"
                    />

                    <div className="min-w-0 flex-1 truncate text-xs font-semibold text-[#45524B]">
                      {
                        evidence.file
                      }
                    </div>

                    <span className="text-[10px] text-[#929A96]">
                      Page{" "}
                      {
                        evidence.page
                      }
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#76817B]">
                    &ldquo;
                    {
                      evidence.excerpt
                    }
                    &rdquo;
                  </p>

                  {/* DIRECT SOURCE LINK */}

                  <div className="mt-3">
                    <Link
                      href={`/cases/${caseId}/evidence/${evidence.evidenceId}?page=${evidence.page}`}
                      className="text-xs font-medium text-[#0F4C3A] transition hover:underline"
                    >
                      Open this
                      source →
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <div className="shrink-0 border-t border-[#E7E9E5] bg-white p-5">
        {primaryEvidence ? (
          <Link
            href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
          >
            Open Source
            Evidence
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="h-10 w-full cursor-not-allowed rounded-lg bg-[#D6DBD7] text-sm font-medium text-[#87918C]"
          >
            No source evidence
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EVENT ICON
========================================================= */

function EventIcon({
  type,
  size = 13,
}: {
  type: string;

  size?: number;
}) {
  switch (type) {
    case "PAYMENT":
      return (
        <CircleDollarSign
          size={size}
        />
      );

    case "COMMUNICATION":
      return (
        <Mail size={size} />
      );

    case "CORPORATE_CHANGE":
      return (
        <Building2
          size={size}
        />
      );

    case "MEETING":
      return (
        <User size={size} />
      );

    default:
      return (
        <CalendarDays
          size={size}
        />
      );
  }
}

/* =========================================================
   EVENT COLORS
========================================================= */

function eventIconStyles(
  type: string,
) {
  switch (type) {
    case "PAYMENT":
      return "bg-[#E5F0EC] text-[#17674B]";

    case "COMMUNICATION":
      return "bg-[#E8EDF5] text-[#536F92]";

    case "CORPORATE_CHANGE":
      return "bg-[#F4EFE1] text-[#9A762E]";

    case "MEETING":
      return "bg-[#EFEAF2] text-[#75617E]";

    default:
      return "bg-[#EEEEEA] text-[#66716B]";
  }
}

/* =========================================================
   REVIEW BADGE
========================================================= */

function ReviewBadge({
  status,
}: {
  status: EventReviewStatus;
}) {
  const styles: Record<
    EventReviewStatus,
    string
  > = {
    CONFIRMED:
      "bg-[#E7F2EC] text-[#19704F]",

    UNREVIEWED:
      "bg-[#F3F0E5] text-[#9A762E]",

    REJECTED:
      "bg-[#F7E9E7] text-[#B64D42]",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[status]}`}
    >
      {formatLabel(
        status,
      )}
    </span>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({
  label,
}: {
  label: string;
}) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#8B9490]">
      {label}
    </div>
  );
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatLabel(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function parseDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function formatMonth(
  value: string,
) {
  return parseDate(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  );
}

function formatDay(
  value: string,
) {
  return parseDate(value)
    .getDate()
    .toString()
    .padStart(2, "0");
}

function formatShortMonth(
  value: string,
) {
  return parseDate(value)
    .toLocaleDateString(
      "en-US",
      {
        month: "short",
      },
    )
    .toUpperCase();
}

function formatFullDate(
  value: string,
) {
  return parseDate(
    value,
  ).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}