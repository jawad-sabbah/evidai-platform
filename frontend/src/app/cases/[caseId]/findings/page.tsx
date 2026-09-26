"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { SectionLabel } from "@/components/ui/section-label";
import { SummaryCard } from "@/components/ui/summary-card";
import { SeverityBadge } from "@/components/ui/severity-badge";

import { formatLabel } from "@/lib/formatters";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Search,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type FindingStatus =
  | "DRAFT"
  | "VERIFIED"
  | "REJECTED";

type FindingSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type FindingEvidence = {
  id: string;
  evidenceId: string;
  file: string;
  page: number;
  excerpt: string;
};

type FindingItem = {
  id: string;

  title: string;

  description: string;

  severity: FindingSeverity;

  status: FindingStatus;

  confidence: number;

  createdBy: string;

  createdAt: string;

  sourceFlagId?: string;

  sourceFlagTitle?: string;

  evidence: FindingEvidence[];

  reviewNotes?: string;

  verifiedBy?: string;

  verifiedAt?: string;

  rejectedBy?: string;

  rejectedAt?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialFindings: FindingItem[] = [
  {
    id: "finding-001",

    title:
      "Possible undisclosed ownership relationship",

    description:
      "Evidence indicates that John Smith may have an undisclosed ownership or control relationship with ACME Ltd.",

    severity:
      "CRITICAL",

    status:
      "DRAFT",

    confidence:
      0.94,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Mar 23, 2026",

    sourceFlagId:
      "flag-001",

    sourceFlagTitle:
      "Possible undisclosed ownership relationship",

    evidence: [
      {
        id:
          "find-evidence-001",

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
          "find-evidence-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement references control rights associated with John Smith.",
      },
    ],
  },

  {
    id:
      "finding-002",

    title:
      "Unusual payment pattern",

    description:
      "Multiple high-value transfers occurred within a short period and appear associated with changes in corporate registration records.",

    severity:
      "HIGH",

    status:
      "DRAFT",

    confidence:
      0.87,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Mar 23, 2026",

    sourceFlagId:
      "flag-002",

    sourceFlagTitle:
      "Unusual payment pattern",

    evidence: [
      {
        id:
          "find-evidence-003",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "Transfer of $100,000 to ACME Ltd.",
      },

      {
        id:
          "find-evidence-004",

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
  },

  {
    id:
      "finding-003",

    title:
      "Conflicting testimony regarding ACME relationship",

    description:
      "John Smith's interview statement conflicts with corporate registry evidence identifying him as a company director.",

    severity:
      "HIGH",

    status:
      "VERIFIED",

    confidence:
      0.91,

    createdBy:
      "Sarah Reed",

    createdAt:
      "Mar 24, 2026",

    verifiedBy:
      "Sarah Reed",

    verifiedAt:
      "Mar 25, 2026",

    reviewNotes:
      "Corporate registry records independently support the finding.",

    sourceFlagId:
      "flag-003",

    sourceFlagTitle:
      "Conflicting testimony",

    evidence: [
      {
        id:
          "find-evidence-005",

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
          "find-evidence-006",

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
  },

  {
    id:
      "finding-004",

    title:
      "Timeline inconsistency in payment authorization",

    description:
      "The stated payment authorization date occurs after the transaction was already recorded as completed.",

    severity:
      "MEDIUM",

    status:
      "REJECTED",

    confidence:
      0.79,

    createdBy:
      "Jawad Sabbah",

    createdAt:
      "Apr 3, 2026",

    rejectedBy:
      "Sarah Reed",

    rejectedAt:
      "Apr 4, 2026",

    reviewNotes:
      "Additional evidence clarified that the approval email was a confirmation rather than the original authorization.",

    sourceFlagId:
      "flag-004",

    sourceFlagTitle:
      "Timeline inconsistency",

    evidence: [
      {
        id:
          "find-evidence-007",

        evidenceId:
          "ev-012",

        file:
          "approval_email.pdf",

        page:
          2,

        excerpt:
          "Approval email timestamp is April 3.",
      },

      {
        id:
          "find-evidence-008",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          24,

        excerpt:
          "Transaction was completed on April 2.",
      },
    ],
  },
];

const statusOptions: Array<
  "ALL" | FindingStatus
> = [
  "ALL",
  "DRAFT",
  "VERIFIED",
  "REJECTED",
];

const severityOptions: Array<
  "ALL" | FindingSeverity
> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

/* =========================================================
   PAGE
========================================================= */

export default function FindingsPage() {
  const { caseId } =
    useParams<{
      caseId: string;
    }>();

  const [
    findings,
    setFindings,
  ] =
    useState<FindingItem[]>(
      initialFindings,
    );

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "ALL" | FindingStatus
    >("ALL");

  const [
    severityFilter,
    setSeverityFilter,
  ] =
    useState<
      "ALL" | FindingSeverity
    >("ALL");

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const [
    severityOpen,
    setSeverityOpen,
  ] =
    useState(false);

  const [
    selectedFindingId,
    setSelectedFindingId,
  ] =
    useState<string | null>(
      initialFindings[1]?.id ??
        null,
    );

  const [
    verifyFinding,
    setVerifyFinding,
  ] =
    useState<FindingItem | null>(
      null,
    );

  const [
    rejectFinding,
    setRejectFinding,
  ] =
    useState<FindingItem | null>(
      null,
    );

  /* =========================================================
     SELECTED FINDING
  ========================================================= */

  const selectedFinding =
    findings.find(
      (finding) =>
        finding.id ===
        selectedFindingId,
    ) ?? null;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredFindings =
    useMemo(() => {
      return findings.filter(
        (finding) => {
          const searchValue =
            query
              .toLowerCase()
              .trim();

          const matchesSearch =
            finding.title
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            finding.description
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            finding.createdBy
              .toLowerCase()
              .includes(
                searchValue,
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            finding.status ===
              statusFilter;

          const matchesSeverity =
            severityFilter ===
              "ALL" ||
            finding.severity ===
              severityFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesSeverity
          );
        },
      );
    }, [
      findings,
      query,
      statusFilter,
      severityFilter,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const draftCount =
    findings.filter(
      (finding) =>
        finding.status ===
        "DRAFT",
    ).length;

  const verifiedCount =
    findings.filter(
      (finding) =>
        finding.status ===
        "VERIFIED",
    ).length;

  const rejectedCount =
    findings.filter(
      (finding) =>
        finding.status ===
        "REJECTED",
    ).length;

  /* =========================================================
     VERIFY
  ========================================================= */

  function handleVerify(
    findingId: string,
    notes: string,
  ) {
    setFindings(
      (current) =>
        current.map(
          (finding) =>
            finding.id ===
            findingId
              ? {
                  ...finding,

                  status:
                    "VERIFIED",

                  reviewNotes:
                    notes,

                  verifiedBy:
                    "Jawad Sabbah",

                  verifiedAt:
                    "Just now",

                  rejectedBy:
                    undefined,

                  rejectedAt:
                    undefined,
                }
              : finding,
        ),
    );

    setVerifyFinding(
      null,
    );

    /*
      Later:

      POST /cases/{caseId}/findings/{findingId}/verify
    */
  }

  /* =========================================================
     REJECT
  ========================================================= */

  function handleReject(
    findingId: string,
    notes: string,
  ) {
    setFindings(
      (current) =>
        current.map(
          (finding) =>
            finding.id ===
            findingId
              ? {
                  ...finding,

                  status:
                    "REJECTED",

                  reviewNotes:
                    notes,

                  rejectedBy:
                    "Jawad Sabbah",

                  rejectedAt:
                    "Just now",

                  verifiedBy:
                    undefined,

                  verifiedAt:
                    undefined,
                }
              : finding,
        ),
    );

    setRejectFinding(
      null,
    );

    /*
      Later:

      POST /cases/{caseId}/findings/{findingId}/reject
    */
  }

  return (
    <AppShell
      showTopbar={false}
    >
      <div className="flex h-full flex-col overflow-hidden bg-[#F7F7F3]">
        {/* =================================================
            CASE HEADER
        ================================================= */}

        <div className="shrink-0 px-8 pt-6">
          <div className="mx-auto max-w-[1380px]">
            <CaseWorkspaceHeader
              caseId={
                caseId
              }
              caseNumber="INV-2026-001"
              title="Suspicious Payments Investigation"
              status="OPEN"
            />
          </div>
        </div>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="shrink-0 px-8 py-5">
          <div className="mx-auto max-w-[1380px]">
            <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Findings
            </h2>

            <p className="mt-1 text-sm text-[#7A8580]">
              Review formal
              investigative
              conclusions created
              from reviewed flags
              and case evidence.
            </p>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="shrink-0 px-8">
          <div className="mx-auto grid max-w-[1380px] grid-cols-4 gap-4">
            <SummaryCard
              label="Total Findings"
              value={
                findings.length
              }
            />

            <SummaryCard
              label="Draft"
              value={
                draftCount
              }
              tone="warning"
            />

            <SummaryCard
              label="Verified"
              value={
                verifiedCount
              }
              tone="success"
            />

            <SummaryCard
              label="Rejected"
              value={
                rejectedCount
              }
              tone="danger"
            />
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 pb-7 pt-5">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[minmax(0,1fr)_380px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                FINDINGS LIST
            ============================================= */}

            <section className="flex min-h-0 flex-col">
              {/* FILTER BAR */}

              <div className="relative z-[50] flex shrink-0 items-center gap-3 overflow-visible border-b border-[#E7E9E5] bg-[#FAFAF7] px-6 py-4">
                {/* SEARCH */}

                <div className="relative flex-1">
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
                    placeholder="Search findings..."
                    className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                  />
                </div>

                {/* SEVERITY */}

                <DropdownFilter
                  label={
                    severityFilter ===
                    "ALL"
                      ? "All severities"
                      : formatLabel(
                          severityFilter,
                        )
                  }
                  open={
                    severityOpen
                  }
                  setOpen={
                    setSeverityOpen
                  }
                  options={
                    severityOptions
                  }
                  selected={
                    severityFilter
                  }
                  onSelect={(
                    value,
                  ) => {
                    setSeverityFilter(
                      value as
                        | "ALL"
                        | FindingSeverity,
                    );

                    setSeverityOpen(
                      false,
                    );
                  }}
                  allLabel="All severities"
                />

                {/* STATUS */}

                <DropdownFilter
                  label={
                    statusFilter ===
                    "ALL"
                      ? "All statuses"
                      : formatLabel(
                          statusFilter,
                        )
                  }
                  open={
                    statusOpen
                  }
                  setOpen={
                    setStatusOpen
                  }
                  options={
                    statusOptions
                  }
                  selected={
                    statusFilter
                  }
                  onSelect={(
                    value,
                  ) => {
                    setStatusFilter(
                      value as
                        | "ALL"
                        | FindingStatus,
                    );

                    setStatusOpen(
                      false,
                    );
                  }}
                  allLabel="All statuses"
                />
              </div>

              {/* FINDINGS */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredFindings.length >
                0 ? (
                  filteredFindings.map(
                    (
                      finding,
                    ) => (
                      <FindingRow
                        key={
                          finding.id
                        }
                        finding={
                          finding
                        }
                        selected={
                          finding.id ===
                          selectedFindingId
                        }
                        onClick={() =>
                          setSelectedFindingId(
                            finding.id,
                          )
                        }
                      />
                    ),
                  )
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center text-center">
                    <div>
                      <ShieldCheck
                        size={
                          28
                        }
                        className="mx-auto text-[#A4ACA8]"
                      />

                      <div className="mt-3 text-sm font-semibold text-[#44504A]">
                        No findings
                        found
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                DETAILS
            ============================================= */}

            <aside className="min-h-0 border-l border-[#E6E8E4] bg-[#FCFCFA]">
              {selectedFinding ? (
                <FindingDetailPanel
                  finding={
                    selectedFinding
                  }
                  caseId={
                    caseId
                  }
                  onClose={() =>
                    setSelectedFindingId(
                      null,
                    )
                  }
                  onVerify={() =>
                    setVerifyFinding(
                      selectedFinding,
                    )
                  }
                  onReject={() =>
                    setRejectFinding(
                      selectedFinding,
                    )
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <ShieldCheck
                      size={
                        27
                      }
                      className="mx-auto text-[#A4ACA8]"
                    />

                    <div className="mt-3 text-sm font-semibold text-[#44504A]">
                      Select a
                      finding
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#8C9590]">
                      Select a
                      finding to
                      review its
                      evidence and
                      investigator
                      status.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* =================================================
            VERIFY MODAL
        ================================================= */}

        {verifyFinding && (
          <VerifyFindingModal
            finding={
              verifyFinding
            }
            onClose={() =>
              setVerifyFinding(
                null,
              )
            }
            onVerify={(
              notes,
            ) =>
              handleVerify(
                verifyFinding.id,
                notes,
              )
            }
          />
        )}

        {/* =================================================
            REJECT MODAL
        ================================================= */}

        {rejectFinding && (
          <RejectFindingModal
            finding={
              rejectFinding
            }
            onClose={() =>
              setRejectFinding(
                null,
              )
            }
            onReject={(
              notes,
            ) =>
              handleReject(
                rejectFinding.id,
                notes,
              )
            }
          />
        )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   FINDING ROW
========================================================= */

function FindingRow({
  finding,
  selected,
  onClick,
}: {
  finding: FindingItem;

  selected: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`w-full border-b border-[#ECEDE9] px-6 py-5 text-left transition ${
        selected
          ? "bg-[#F4F6F3]"
          : finding.status ===
            "REJECTED"
          ? "bg-[#FCFAF9] opacity-70"
          : "bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            finding.status ===
            "VERIFIED"
              ? "bg-[#E7F2EC] text-[#19704F]"
              : finding.status ===
                "REJECTED"
              ? "bg-[#F7E9E7] text-[#B64D42]"
              : "bg-[#F3F0E5] text-[#98752D]"
          }`}
        >
          <ShieldCheck
            size={
              17
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SeverityBadge
              severity={
                finding.severity
              }
            />

            <FindingStatusBadge
              status={
                finding.status
              }
            />

            <span className="ml-auto text-xs font-semibold text-[#45524B]">
              {Math.round(
                finding.confidence *
                  100,
              )}
              %
            </span>
          </div>

          <h3 className="mt-3 text-[15px] font-semibold text-[#26312C]">
            {
              finding.title
            }
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#707B75]">
            {
              finding.description
            }
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-[11px] text-[#89928D]">
            {finding.sourceFlagId && (
              <span>
                From flag{" "}
                {
                  finding.sourceFlagId
                }
              </span>
            )}

            <span>
              {
                finding.evidence
                  .length
              }{" "}
              {finding.evidence.length ===
              1
                ? "evidence source"
                : "evidence sources"}
            </span>

            <span className="ml-auto">
              {
                finding.createdAt
              }
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   DETAIL PANEL
========================================================= */

function FindingDetailPanel({
  finding,
  caseId,
  onClose,
  onVerify,
  onReject,
}: {
  finding: FindingItem;

  caseId: string;

  onClose: () => void;

  onVerify: () => void;

  onReject: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="shrink-0 border-b border-[#E7E9E5] bg-white p-6">
        <div className="flex items-center justify-between">
          <SectionLabel label="Finding Details" />

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] hover:bg-[#F1F3EF]"
          >
            <X
              size={15}
            />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge
              severity={
                finding.severity
              }
            />

            <FindingStatusBadge
              status={
                finding.status
              }
            />
          </div>

          <h3 className="mt-3 text-[18px] font-semibold leading-6 text-[#26312C]">
            {
              finding.title
            }
          </h3>
        </div>
      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* DESCRIPTION */}

        <SectionLabel label="Description" />

        <p className="mt-2 text-sm leading-6 text-[#626E68]">
          {
            finding.description
          }
        </p>

        {/* SOURCE FLAG */}

        {finding.sourceFlagId && (
          <div className="mt-7">
            <SectionLabel label="Source Flag" />

            <div className="mt-3 rounded-lg border border-[#E6E8E4] bg-white p-4">
              <div className="text-sm font-semibold text-[#39453F]">
                {
                  finding.sourceFlagTitle
                }
              </div>

              <div className="mt-1 text-[10px] text-[#929A96]">
                {
                  finding.sourceFlagId
                }
              </div>
            </div>
          </div>
        )}

        {/* INVESTIGATOR REVIEW */}

        <div className="mt-7">
          <SectionLabel label="Investigator Review" />

          <div className="mt-3 rounded-lg border border-[#E6E8E4] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#7A8580]">
                <User
                  size={
                    13
                  }
                />

                Created by
              </div>

              <span className="text-xs font-medium text-[#39453F]">
                {
                  finding.createdBy
                }
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#7A8580]">
                <FileText
                  size={
                    13
                  }
                />

                Created
              </div>

              <span className="text-xs font-medium text-[#39453F]">
                {
                  finding.createdAt
                }
              </span>
            </div>

            {finding.verifiedBy && (
              <>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#7A8580]">
                    Verified by
                  </span>

                  <span className="text-xs font-medium text-[#19704F]">
                    {
                      finding.verifiedBy
                    }
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#7A8580]">
                    Verified
                  </span>

                  <span className="text-xs font-medium text-[#39453F]">
                    {
                      finding.verifiedAt
                    }
                  </span>
                </div>
              </>
            )}

            {finding.rejectedBy && (
              <>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#7A8580]">
                    Rejected by
                  </span>

                  <span className="text-xs font-medium text-[#B64D42]">
                    {
                      finding.rejectedBy
                    }
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#7A8580]">
                    Rejected
                  </span>

                  <span className="text-xs font-medium text-[#39453F]">
                    {
                      finding.rejectedAt
                    }
                  </span>
                </div>
              </>
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
                    finding.confidence *
                    100
                  }%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-[#0F4C3A]">
              {Math.round(
                finding.confidence *
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
            {finding.evidence.map(
              (
                evidence,
              ) => (
                <div
                  key={
                    evidence.id
                  }
                  className="rounded-lg border border-[#E5E8E4] bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      size={
                        14
                      }
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

                  <div className="mt-3">
                    <Link
                      href={`/cases/${caseId}/evidence/${evidence.evidenceId}?page=${evidence.page}`}
                      className="text-xs font-medium text-[#0F4C3A] hover:underline"
                    >
                      Open evidence →
                    </Link>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* REVIEW NOTES */}

        {finding.reviewNotes && (
          <div className="mt-7">
            <SectionLabel label="Review Notes" />

            <div className="mt-3 rounded-lg border border-[#E6E8E4] bg-[#FAFAF7] p-4 text-xs leading-5 text-[#66716B]">
              {
                finding.reviewNotes
              }
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="shrink-0 border-t border-[#E7E9E5] bg-white p-5">
        {finding.status ===
          "DRAFT" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                onReject
              }
              className="h-10 rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#59645F] transition hover:bg-[#F7EEEE] hover:text-[#A94E45]"
            >
              Reject
            </button>

            <button
              type="button"
              onClick={
                onVerify
              }
              className="h-10 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              Verify Finding
            </button>
          </div>
        )}

        {finding.status ===
          "VERIFIED" && (
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#EAF4EE] text-sm font-medium text-[#19704F]">
            <CheckCircle2
              size={
                15
              }
            />

            Verified Finding
          </div>
        )}

        {finding.status ===
          "REJECTED" && (
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F7E9E7] text-sm font-medium text-[#B64D42]">
            <XCircle
              size={
                15
              }
            />

            Rejected Finding
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   VERIFY MODAL
========================================================= */

function VerifyFindingModal({
  finding,
  onClose,
  onVerify,
}: {
  finding: FindingItem;

  onClose: () => void;

  onVerify: (
    notes: string,
  ) => void;
}) {
  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    confirmed,
    setConfirmed,
  ] =
    useState(false);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[580px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Finding Review
            </div>

            <h2 className="mt-2 text-[22px] font-semibold text-[#18201D]">
              Verify finding
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Confirm that the
              finding is supported
              by the reviewed
              evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] hover:bg-[#F1F3EF]"
          >
            <X
              size={
                16
              }
            />
          </button>
        </div>

        <div className="px-7 py-6">
          <div className="rounded-xl border border-[#E6E8E4] bg-[#FAFAF7] p-4">
            <div className="text-sm font-semibold text-[#35413B]">
              {
                finding.title
              }
            </div>

            <p className="mt-2 text-xs leading-5 text-[#76817B]">
              {
                finding.description
              }
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-[#35413B]">
              Review notes
            </label>

            <textarea
              value={
                notes
              }
              onChange={(
                event,
              ) =>
                setNotes(
                  event
                    .target
                    .value,
                )
              }
              rows={4}
              placeholder="Explain why this finding is verified..."
              className="mt-2 w-full resize-none rounded-lg border border-[#DDE1DC] px-4 py-3 text-sm outline-none focus:border-[#93AA9F]"
            />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={
                confirmed
              }
              onChange={(
                event,
              ) =>
                setConfirmed(
                  event
                    .target
                    .checked,
                )
              }
              className="mt-0.5 h-4 w-4 accent-[#0F4C3A]"
            />

            <div>
              <div className="text-sm font-medium text-[#35413B]">
                I reviewed the
                supporting evidence
              </div>

              <p className="mt-1 text-xs leading-5 text-[#87918C]">
                Verification means
                this finding can be
                treated as
                investigator-reviewed
                case intelligence.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <button
            type="button"
            onClick={
              onClose
            }
            className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !confirmed
            }
            onClick={() =>
              onVerify(
                notes,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2
              size={
                15
              }
            />

            Verify Finding
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REJECT MODAL
========================================================= */

function RejectFindingModal({
  finding,
  onClose,
  onReject,
}: {
  finding: FindingItem;

  onClose: () => void;

  onReject: (
    notes: string,
  ) => void;
}) {
  const [
    notes,
    setNotes,
  ] =
    useState("");

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Finding Review
            </div>

            <h2 className="mt-2 text-[22px] font-semibold text-[#18201D]">
              Reject finding
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] hover:bg-[#F1F3EF]"
          >
            <X
              size={
                16
              }
            />
          </button>
        </div>

        <div className="px-7 py-6">
          <div className="rounded-xl border border-[#E6E8E4] bg-[#FAFAF7] p-4">
            <div className="text-sm font-semibold text-[#35413B]">
              {
                finding.title
              }
            </div>

            <p className="mt-2 text-xs leading-5 text-[#76817B]">
              {
                finding.description
              }
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-[#35413B]">
              Reason for
              rejection
            </label>

            <textarea
              value={
                notes
              }
              onChange={(
                event,
              ) =>
                setNotes(
                  event
                    .target
                    .value,
                )
              }
              rows={4}
              placeholder="Explain why this finding should not be verified..."
              className="mt-2 w-full resize-none rounded-lg border border-[#DDE1DC] px-4 py-3 text-sm outline-none focus:border-[#93AA9F]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <button
            type="button"
            onClick={
              onClose
            }
            className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !notes.trim()
            }
            onClick={() =>
              onReject(
                notes.trim(),
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#B64D42] px-5 text-sm font-medium text-white hover:bg-[#9F4138] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle
              size={
                15
              }
            />

            Reject Finding
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DROPDOWN FILTER
========================================================= */

function DropdownFilter({
  label,
  open,
  setOpen,
  options,
  selected,
  onSelect,
  allLabel,
}: {
  label: string;

  open: boolean;

  setOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;

  options: string[];

  selected: string;

  onSelect: (
    value: string,
  ) => void;

  allLabel: string;
}) {
  return (
    <div className="relative z-[60]">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              current,
            ) =>
              !current,
          )
        }
        className="flex h-10 min-w-[160px] items-center justify-between gap-3 rounded-lg border border-[#DFE3DE] bg-white px-4 text-sm text-[#59645F]"
      >
        {
          label
        }

        <ChevronDown
          size={
            15
          }
          className={`transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[999] w-[190px] rounded-xl border border-[#E1E4DF] bg-white p-1.5 shadow-xl">
          {options.map(
            (
              option,
            ) => (
              <button
                key={
                  option
                }
                type="button"
                onClick={() =>
                  onSelect(
                    option,
                  )
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                  selected ===
                  option
                    ? "bg-[#EEF3F0] font-medium text-[#0F4C3A]"
                    : "text-[#59645F] hover:bg-[#F3F5F1]"
                }`}
              >
                {option ===
                "ALL"
                  ? allLabel
                  : formatLabel(
                      option,
                    )}

                {selected ===
                  option && (
                  <Check
                    size={
                      13
                    }
                  />
                )}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function FindingStatusBadge({
  status,
}: {
  status:
    FindingStatus;
}) {
  const styles: Record<
    FindingStatus,
    string
  > = {
    DRAFT:
      "bg-[#F3F0E5] text-[#98752D]",

    VERIFIED:
      "bg-[#E7F2EC] text-[#19704F]",

    REJECTED:
      "bg-[#F7E9E7] text-[#B64D42]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[status]}`}
    >
      {
        formatLabel(
          status,
        )
      }
    </span>
  );
}

