"use client";

import Link from "next/link";

import {formatLabel} from "@/lib/formatters";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileText,
  FolderOpen,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

/* =========================================================
   TYPES
========================================================= */

type CaseStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "CLOSED"
  | "ARCHIVED";

type EvidenceStatus =
  | "READY"
  | "PROCESSING"
  | "FAILED"
  | "QUEUED";

type RecentCase = {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  status: CaseStatus;
  updatedAt: string;
};

type AttentionItem = {
  id: string;
  label: string;
  description: string;
  count: number;
  href: string;

  tone:
    | "warning"
    | "danger"
    | "neutral";
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;

  type:
    | "EVIDENCE"
    | "ENTITY"
    | "FINDING"
    | "REPORT"
    | "CLAIM";
};

type EvidencePipelineItem = {
  id: string;
  file: string;
  caseNumber: string;
  status: EvidenceStatus;
  progress?: number;
};

/* =========================================================
   MOCK CURRENT USER

   Later this should come from authentication/session.
========================================================= */

const currentUser = {
  name: "Jawad Sabbah",
  firstName: "Jawad",
  role: "Investigator",
};

/* =========================================================
   MOCK DATA
========================================================= */

const recentCases: RecentCase[] = [
  {
    id: "1",

    caseNumber:
      "INV-2026-001",

    title:
      "Suspicious Payments Investigation",

    type:
      "Money Laundering",

    status:
      "OPEN",

    updatedAt:
      "12 min ago",
  },

  {
    id: "2",

    caseNumber:
      "INV-2026-002",

    title:
      "Offshore Transfers Review",

    type:
      "Compliance Review",

    status:
      "IN_REVIEW",

    updatedAt:
      "45 min ago",
  },

  {
    id: "3",

    caseNumber:
      "INV-2026-003",

    title:
      "Procurement Fraud Investigation",

    type:
      "Procurement Fraud",

    status:
      "OPEN",

    updatedAt:
      "2h ago",
  },

  {
    id: "4",

    caseNumber:
      "INV-2026-004",

    title:
      "Internal Asset Misappropriation",

    type:
      "Asset Misappropriation",

    status:
      "OPEN",

    updatedAt:
      "1d ago",
  },
];

const attentionItems: AttentionItem[] = [
  {
    id:
      "attention-001",

    label:
      "Entities awaiting review",

    description:
      "AI-extracted entities require investigator confirmation.",

    count:
      7,

    href:
      "/cases/1/entities",

    tone:
      "warning",
  },

  {
    id:
      "attention-002",

    label:
      "Unverified claims",

    description:
      "Claims have not yet been reviewed against available evidence.",

    count:
      3,

    href:
      "/cases/1/claims",

    tone:
      "warning",
  },

  {
    id:
      "attention-003",

    label:
      "Open flags",

    description:
      "Potential investigative issues are waiting for review.",

    count:
      4,

    href:
      "/cases/1/flags",

    tone:
      "warning",
  },

  {
    id:
      "attention-004",

    label:
      "Draft findings",

    description:
      "Findings need verification before they can feed reports.",

    count:
      2,

    href:
      "/cases/1/findings",

    tone:
      "neutral",
  },

  {
    id:
      "attention-005",

    label:
      "Failed evidence processing",

    description:
      "One evidence item requires retry or error review.",

    count:
      1,

    href:
      "/cases/1/evidence",

    tone:
      "danger",
  },
];

const activityItems: ActivityItem[] = [
  {
    id:
      "activity-001",

    title:
      "Evidence uploaded",

    description:
      "bank_statement.pdf added to INV-2026-001",

    time:
      "10 min ago",

    type:
      "EVIDENCE",
  },

  {
    id:
      "activity-002",

    title:
      "Finding verified",

    description:
      "Conflicting testimony regarding ACME relationship",

    time:
      "24 min ago",

    type:
      "FINDING",
  },

  {
    id:
      "activity-003",

    title:
      "Entity reviewed",

    description:
      "John Smith confirmed as a Person entity",

    time:
      "38 min ago",

    type:
      "ENTITY",
  },

  {
    id:
      "activity-004",

    title:
      "Report generated",

    description:
      "Investigation Report — Suspicious Payments",

    time:
      "1h ago",

    type:
      "REPORT",
  },

  {
    id:
      "activity-005",

    title:
      "Claim reviewed",

    description:
      "\"I never worked for ACME Ltd\" marked contradicted",

    time:
      "2h ago",

    type:
      "CLAIM",
  },
];

const evidencePipeline: EvidencePipelineItem[] = [
  {
    id:
      "pipeline-001",

    file:
      "bank_statement.pdf",

    caseNumber:
      "INV-2026-001",

    status:
      "READY",

    progress:
      100,
  },

  {
    id:
      "pipeline-002",

    file:
      "email_archive.zip",

    caseNumber:
      "INV-2026-001",

    status:
      "PROCESSING",

    progress:
      68,
  },

  {
    id:
      "pipeline-003",

    file:
      "company_registry.pdf",

    caseNumber:
      "INV-2026-002",

    status:
      "QUEUED",

    progress:
      0,
  },

  {
    id:
      "pipeline-004",

    file:
      "transactions.csv",

    caseNumber:
      "INV-2026-003",

    status:
      "FAILED",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function DashboardPage() {
  return (
    <AppShell
      showTopbar={false}
    >
      <div className="h-full overflow-y-auto bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1380px] px-8 py-7">
          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="relative overflow-hidden rounded-2xl border border-[#DCE5DF] bg-[#EEF4F0]">
            {/* DECORATION */}

            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/30" />

            <div className="pointer-events-none absolute -bottom-28 right-32 h-52 w-52 rounded-full border-[30px] border-[#DCE9E1]/60" />

            <div className="relative flex items-center justify-between gap-8 px-7 py-7">
              {/* LEFT */}

              <div className="max-w-[720px]">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-[#0F4C3A] shadow-sm">
                    <Sparkles
                      size={13}
                    />
                  </div>

                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62776C]">
                    Investigation Workspace
                  </span>
                </div>

                <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.04em] text-[#183128]">
                  Welcome back,{" "}
                  {currentUser.firstName}.
                </h1>

                <p className="mt-2 max-w-[650px] text-sm leading-6 text-[#687A70]">
                  You have{" "}
                  <span className="font-semibold text-[#314A3E]">
                    23 review items
                  </span>{" "}
                  waiting across your active
                  investigations. Start with the
                  items requiring attention or
                  continue your most recent case.
                </p>

                {/* QUICK ACTIONS */}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/cases/new"
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white transition hover:bg-[#0A382B]"
                  >
                    <Plus
                      size={15}
                    />

                    New Case
                  </Link>

                  <Link
                    href="/ai"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9D7CF] bg-white/80 px-4 text-sm font-medium text-[#355346] transition hover:bg-white"
                  >
                    <Sparkles
                      size={14}
                    />

                    Ask AI Investigator
                  </Link>

                  <Link
                    href="/cases/1"
                    className="inline-flex h-10 items-center gap-2 px-2 text-sm font-medium text-[#476357] transition hover:text-[#0F4C3A]"
                  >
                    Continue recent case

                    <ArrowRight
                      size={14}
                    />
                  </Link>
                </div>
              </div>

              {/* RIGHT SUMMARY */}

              <div className="hidden min-w-[280px] xl:block">
                <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#87948E]">
                        Today
                      </div>

                      <div className="mt-1 text-sm font-semibold text-[#30443A]">
                        Investigation summary
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2ED] text-[#0F4C3A]">
                      <ShieldCheck
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <MiniSummary
                      label="Cases updated"
                      value="3"
                    />

                    <MiniSummary
                      label="Evidence processed"
                      value="14"
                    />

                    <MiniSummary
                      label="Findings verified"
                      value="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              HEADER ROW
          ================================================= */}

          <div className="mt-8 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-[23px] font-semibold tracking-[-0.025em] text-[#18201D]">
                Investigation overview
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Current workload and activity
                across your investigation
                workspace.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#E1E5E1] bg-white px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-[#4C8B73]" />

              <span className="text-[11px] font-medium text-[#627169]">
                Workspace active
              </span>
            </div>
          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="mt-5 grid grid-cols-4 gap-4">
            <DashboardMetric
              label="Open Cases"
              value="12"
              helper="3 updated today"
              icon={
                <FolderOpen
                  size={17}
                />
              }
            />

            <DashboardMetric
              label="Evidence"
              value="184"
              helper="176 ready"
              icon={
                <FileText
                  size={17}
                />
              }
            />

            <DashboardMetric
              label="Pending Reviews"
              value="23"
              helper="Across active cases"
              tone="warning"
              icon={
                <Clock3
                  size={17}
                />
              }
            />

            <DashboardMetric
              label="Verified Findings"
              value="8"
              helper="Ready for reports"
              tone="success"
              icon={
                <ShieldCheck
                  size={17}
                />
              }
            />
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="mt-6 grid grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)] gap-6">
            {/* =============================================
                LEFT
            ============================================= */}

            <div className="space-y-6">
              {/* RECENT CASES */}

              <DashboardCard>
                <CardHeader
                  title="Recent Cases"
                  description="Continue working on recently active investigations."
                  action={
                    <Link
                      href="/cases"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0F4C3A] hover:underline"
                    >
                      View all cases

                      <ArrowRight
                        size={12}
                      />
                    </Link>
                  }
                />

                <div className="mt-5 overflow-hidden rounded-xl border border-[#E6E8E4] bg-white">
                  {/* HEADER */}

                  <div className="grid grid-cols-[125px_minmax(240px,1.6fr)_1fr_110px_100px] border-b border-[#E7E9E5] bg-[#FAFAF7] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
                    <div>
                      Case
                    </div>

                    <div>
                      Title
                    </div>

                    <div>
                      Type
                    </div>

                    <div>
                      Status
                    </div>

                    <div className="text-right">
                      Updated
                    </div>
                  </div>

                  {/* ROWS */}

                  {recentCases.map(
                    (
                      caseItem,
                    ) => (
                      <Link
                        key={
                          caseItem.id
                        }
                        href={`/cases/${caseItem.id}`}
                        className="group grid grid-cols-[125px_minmax(240px,1.6fr)_1fr_110px_100px] items-center border-b border-[#ECEDE9] px-5 py-4 last:border-b-0 transition hover:bg-[#FAFAF7]"
                      >
                        <div className="text-xs font-semibold text-[#0F4C3A]">
                          {
                            caseItem.caseNumber
                          }
                        </div>

                        <div className="min-w-0 pr-4">
                          <div className="truncate text-sm font-semibold text-[#2F3A35] transition group-hover:text-[#0F4C3A]">
                            {
                              caseItem.title
                            }
                          </div>
                        </div>

                        <div className="truncate pr-4 text-xs text-[#6F7974]">
                          {
                            caseItem.type
                          }
                        </div>

                        <div>
                          <CaseStatusBadge
                            status={
                              caseItem.status
                            }
                          />
                        </div>

                        <div className="text-right text-[11px] text-[#8E9792]">
                          {
                            caseItem.updatedAt
                          }
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </DashboardCard>

              {/* =================================================
                  EVIDENCE PROCESSING
              ================================================= */}

              <DashboardCard>
                <CardHeader
                  title="Evidence Processing"
                  description="Track recently ingested files and processing activity."
                  action={
                    <Link
                      href="/evidence"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#0F4C3A] hover:underline"
                    >
                      View evidence

                      <ArrowRight
                        size={12}
                      />
                    </Link>
                  }
                />

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {evidencePipeline.map(
                    (
                      item,
                    ) => (
                      <EvidencePipelineCard
                        key={
                          item.id
                        }
                        item={
                          item
                        }
                      />
                    ),
                  )}
                </div>
              </DashboardCard>

              {/* =================================================
                  AI INVESTIGATOR
              ================================================= */}

              <div className="relative overflow-hidden rounded-2xl border border-[#D9E4DD] bg-[#EEF4F0]">
                <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full border-[24px] border-white/30" />

                <div className="relative flex items-center justify-between gap-8 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F4C3A] text-white shadow-sm">
                      <Sparkles
                        size={18}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-[#26332D]">
                        Ask EvidAI about an
                        investigation
                      </div>

                      <p className="mt-1 max-w-[560px] text-sm leading-6 text-[#69766F]">
                        Explore relationships,
                        payment patterns,
                        contradictions and
                        verified findings using
                        evidence-grounded answers.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <AiSuggestion>
                          Summarize key risks
                        </AiSuggestion>

                        <AiSuggestion>
                          Find contradictions
                        </AiSuggestion>

                        <AiSuggestion>
                          Analyze payments
                        </AiSuggestion>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/ai"
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white transition hover:bg-[#0A382B]"
                  >
                    Open AI Investigator

                    <ArrowRight
                      size={14}
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* =============================================
                RIGHT
            ============================================= */}

            <div className="space-y-6">
              {/* =================================================
                  PRIORITY CARD
              ================================================= */}

              <div className="rounded-2xl border border-[#E5E0D1] bg-[#FAF8F1] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1EAD6] text-[#98752D]">
                    <Clock3
                      size={15}
                    />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-[#584D2F]">
                      Today&apos;s priority
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#857958]">
                      Review the 7 newly
                      extracted entities in{" "}
                      <span className="font-semibold">
                        INV-2026-001
                      </span>{" "}
                      before validating related
                      claims and findings.
                    </p>

                    <Link
                      href="/cases/1/entities"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#876923] hover:underline"
                    >
                      Start review

                      <ArrowRight
                        size={12}
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* =================================================
                  NEEDS ATTENTION
              ================================================= */}

              <DashboardCard>
                <CardHeader
                  title="Needs Attention"
                  description="Work currently waiting for investigator action."
                />

                <div className="mt-5 space-y-2">
                  {attentionItems.map(
                    (
                      item,
                    ) => (
                      <Link
                        key={
                          item.id
                        }
                        href={
                          item.href
                        }
                        className="group flex items-center gap-3 rounded-xl border border-[#E5E8E4] bg-white px-4 py-3.5 transition hover:border-[#D6DDD8] hover:bg-[#FAFAF7]"
                      >
                        <AttentionIcon
                          tone={
                            item.tone
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[#45514B]">
                            {
                              item.label
                            }
                          </div>

                          <p className="mt-0.5 truncate text-[10px] text-[#909894]">
                            {
                              item.description
                            }
                          </p>
                        </div>

                        <div
                          className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                            item.tone ===
                            "danger"
                              ? "bg-[#F7E9E7] text-[#B64D42]"
                              : item.tone ===
                                "warning"
                              ? "bg-[#F3F0E5] text-[#98752D]"
                              : "bg-[#EEF1EE] text-[#66716B]"
                          }`}
                        >
                          {
                            item.count
                          }
                        </div>

                        <ArrowRight
                          size={13}
                          className="text-[#A0A7A3] transition group-hover:translate-x-0.5 group-hover:text-[#0F4C3A]"
                        />
                      </Link>
                    ),
                  )}
                </div>
              </DashboardCard>

              {/* =================================================
                  RECENT ACTIVITY
              ================================================= */}

              <DashboardCard>
                <CardHeader
                  title="Recent Activity"
                  description="Latest actions across your workspace."
                />

                <div className="mt-4">
                  {activityItems.map(
                    (
                      activity,
                      index,
                    ) => (
                      <div
                        key={
                          activity.id
                        }
                        className={`flex gap-3 py-4 ${
                          index !==
                          activityItems.length -
                            1
                            ? "border-b border-[#ECEDE9]"
                            : ""
                        }`}
                      >
                        <ActivityIcon
                          type={
                            activity.type
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#3E4A44]">
                            {
                              activity.title
                            }
                          </div>

                          <p className="mt-1 text-xs leading-5 text-[#7C8781]">
                            {
                              activity.description
                            }
                          </p>
                        </div>

                        <span className="shrink-0 pt-0.5 text-[10px] text-[#9AA29E]">
                          {
                            activity.time
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </DashboardCard>
            </div>
          </div>

          {/* =================================================
              BOTTOM QUICK ACTIONS
          ================================================= */}

          <div className="mt-6">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#8A938E]">
              Quick Actions
            </div>

            <div className="grid grid-cols-4 gap-3">
              <QuickAction
                href="/cases/new"
                icon={
                  <Plus
                    size={15}
                  />
                }
                title="Create Case"
                description="Start a new investigation."
              />

              <QuickAction
                href="/evidence"
                icon={
                  <FilePlus2
                    size={15}
                  />
                }
                title="Evidence"
                description="Review uploaded evidence."
              />

              <QuickAction
                href="/cases"
                icon={
                  <Search
                    size={15}
                  />
                }
                title="Browse Cases"
                description="Open an existing case."
              />

              <QuickAction
                href="/ai"
                icon={
                  <Sparkles
                    size={15}
                  />
                }
                title="AI Investigator"
                description="Ask across case intelligence."
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   MINI SUMMARY
========================================================= */

function MiniSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#E8ECE8] pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs text-[#748179]">
        {label}
      </span>

      <span className="text-sm font-semibold text-[#30453A]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function DashboardMetric({
  label,
  value,
  helper,
  icon,
  tone = "normal",
}: {
  label: string;

  value: string;

  helper: string;

  icon: React.ReactNode;

  tone?:
    | "normal"
    | "success"
    | "warning";
}) {
  const toneStyles = {
    normal:
      "text-[#18201D]",

    success:
      "text-[#19704F]",

    warning:
      "text-[#98752D]",
  };

  return (
    <div className="group rounded-xl border border-[#E3E6E2] bg-white p-5 shadow-[0_2px_10px_rgba(28,40,34,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(28,40,34,0.05)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
          {icon}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#94A09A]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#4D8B73]" />

          Live
        </div>
      </div>

      <div
        className={`mt-5 text-[29px] font-semibold tracking-[-0.04em] ${toneStyles[tone]}`}
      >
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-[#46534C]">
        {label}
      </div>

      <div className="mt-1 text-[11px] text-[#929A96]">
        {helper}
      </div>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function DashboardCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E3E6E2] bg-white p-6 shadow-[0_4px_18px_rgba(28,40,34,0.03)]">
      {children}
    </div>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  title,
  description,
  action,
}: {
  title: string;

  description: string;

  action?:
    React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h2 className="text-[17px] font-semibold text-[#26312C]">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-[#87918C]">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   CASE STATUS
========================================================= */

function CaseStatusBadge({
  status,
}: {
  status:
    CaseStatus;
}) {
  const styles: Record<
    CaseStatus,
    string
  > = {
    OPEN:
      "bg-[#E7F2EC] text-[#19704F]",

    IN_REVIEW:
      "bg-[#F3F0E5] text-[#98752D]",

    CLOSED:
      "bg-[#EDF0EE] text-[#66716B]",

    ARCHIVED:
      "bg-[#ECECEF] text-[#777786]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[status]}`}
    >
      {formatLabel(
        status,
      )}
    </span>
  );
}

/* =========================================================
   EVIDENCE CARD
========================================================= */

function EvidencePipelineCard({
  item,
}: {
  item:
    EvidencePipelineItem;
}) {
  return (
    <div className="rounded-xl border border-[#E5E8E4] bg-[#FAFAF7] p-4 transition hover:bg-[#F7F8F5]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F4C3A] shadow-sm">
          <FileText
            size={15}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-[#3E4A44]">
            {
              item.file
            }
          </div>

          <div className="mt-1 text-[10px] text-[#919995]">
            {
              item.caseNumber
            }
          </div>
        </div>

        <EvidenceStatusBadge
          status={
            item.status
          }
        />
      </div>

      {item.status ===
        "PROCESSING" && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] text-[#929A96]">
              Processing
            </span>

            <span className="text-[10px] font-semibold text-[#0F4C3A]">
              {
                item.progress
              }
              %
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E9E5]">
            <div
              className="h-full rounded-full bg-[#4D8B73]"
              style={{
                width: `${item.progress ?? 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {item.status ===
        "FAILED" && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[#B64D42]">
          <AlertTriangle
            size={11}
          />

          Processing requires
          attention
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EVIDENCE STATUS
========================================================= */

function EvidenceStatusBadge({
  status,
}: {
  status:
    EvidenceStatus;
}) {
  const styles: Record<
    EvidenceStatus,
    string
  > = {
    READY:
      "bg-[#E7F2EC] text-[#19704F]",

    PROCESSING:
      "bg-[#E8EDF5] text-[#55708D]",

    QUEUED:
      "bg-[#F3F0E5] text-[#98752D]",

    FAILED:
      "bg-[#F7E9E7] text-[#B64D42]",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold tracking-[0.04em] ${styles[status]}`}
    >
      {formatLabel(
        status,
      )}
    </span>
  );
}

/* =========================================================
   ATTENTION ICON
========================================================= */

function AttentionIcon({
  tone,
}: {
  tone:
    | "warning"
    | "danger"
    | "neutral";
}) {
  if (
    tone === "danger"
  ) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7E9E7] text-[#B64D42]">
        <AlertTriangle
          size={14}
        />
      </div>
    );
  }

  if (
    tone === "warning"
  ) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F0E5] text-[#98752D]">
        <Clock3
          size={14}
        />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF1EE] text-[#66716B]">
      <CheckCircle2
        size={14}
      />
    </div>
  );
}

/* =========================================================
   ACTIVITY ICON
========================================================= */

function ActivityIcon({
  type,
}: {
  type:
    ActivityItem["type"];
}) {
  const wrapper =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg";

  switch (type) {
    case "EVIDENCE":
      return (
        <div
          className={`${wrapper} bg-[#E8EDF5] text-[#55708D]`}
        >
          <FileText
            size={14}
          />
        </div>
      );

    case "ENTITY":
      return (
        <div
          className={`${wrapper} bg-[#E8F0EB] text-[#0F4C3A]`}
        >
          <Users
            size={14}
          />
        </div>
      );

    case "FINDING":
      return (
        <div
          className={`${wrapper} bg-[#E7F2EC] text-[#19704F]`}
        >
          <ShieldCheck
            size={14}
          />
        </div>
      );

    case "REPORT":
      return (
        <div
          className={`${wrapper} bg-[#EFEAF2] text-[#75617E]`}
        >
          <FileText
            size={14}
          />
        </div>
      );

    case "CLAIM":
      return (
        <div
          className={`${wrapper} bg-[#F3F0E5] text-[#98752D]`}
        >
          <MessageSquare
            size={14}
          />
        </div>
      );

    default:
      return (
        <div
          className={`${wrapper} bg-[#EEF1EE] text-[#66716B]`}
        >
          <CheckCircle2
            size={14}
          />
        </div>
      );
  }
}

/* =========================================================
   AI SUGGESTION
========================================================= */

function AiSuggestion({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-[#D7E2DB] bg-white/60 px-2.5 py-1 text-[10px] font-medium text-[#60736A]">
      {children}
    </span>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;

  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[#E3E6E2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C8D6CE] hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A] transition group-hover:bg-[#E4EEE8]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#3E4B44]">
          {title}
        </div>

        <div className="mt-0.5 text-[10px] text-[#8A938E]">
          {description}
        </div>
      </div>

      <ArrowRight
        size={13}
        className="text-[#A0A7A3] transition group-hover:translate-x-0.5 group-hover:text-[#0F4C3A]"
      />
    </Link>
  );
}

