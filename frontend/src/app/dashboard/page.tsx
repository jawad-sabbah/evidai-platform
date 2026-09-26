"use client";

import Link from "next/link";


import {
  ArrowRight,
  Clock3,
  FilePlus2,
  FileText,
  FolderOpen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

import {QuickAction} from "@/components/dashboard/quick-action";
import {AiSuggestion} from "@/components/dashboard/ai-suggestion";
import {ActivityIcon} from "@/components/dashboard/activity-icon";
import {AttentionIcon} from "@/components/dashboard/attention-icon";
import {EvidencePipelineCard} from "@/components/dashboard/evidence-pipeline-card";
import {DashboardCard} from "@/components/dashboard/dashboard-card";
import {DashboardMetric} from "@/components/dashboard/dashboard-metric";

import {CardHeader} from "@/components/ui/card-header";
import {CaseStatusBadge} from "@/components/ui/case-status-badge";

import {currentUser,recentCases,attentionItems,activityItems,evidencePipeline,
} from "@/data/mocks/dashboard";

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

