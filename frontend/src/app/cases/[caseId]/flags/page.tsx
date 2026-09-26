"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { formatLabel } from "@/lib/formatters";
import { SeverityBadge } from "@/components/ui/severity-badge";

import { SectionLabel } from "@/components/ui/section-label";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flag,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type FlagSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type FlagStatus =
  | "OPEN"
  | "REVIEWED"
  | "DISMISSED"
  | "CONVERTED";

type FlagEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

type FlagItem = {
  id: string;

  title: string;

  description: string;

  detectionType: string;

  severity: FlagSeverity;

  status: FlagStatus;

  confidence: number;

  createdAt: string;

  evidence: FlagEvidence[];

  reviewNotes?: string;

  findingId?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialFlags: FlagItem[] = [
  {
    id: "flag-001",

    title:
      "Possible undisclosed ownership relationship",

    description:
      "Evidence suggests John Smith may have an undisclosed ownership or control relationship with ACME Ltd.",

    detectionType:
      "Undisclosed Relationship",

    severity:
      "CRITICAL",

    status:
      "OPEN",

    confidence:
      0.94,

    createdAt:
      "Mar 18, 2026",

    evidence: [
      {
        id:
          "fe-001",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith appears as a listed director of ACME Ltd.",
      },

      {
        id:
          "fe-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement references control rights associated with John Smith.",
      },

      {
        id:
          "fe-003",

        evidenceId:
          "ev-008",

        file:
          "email_thread.pdf",

        page:
          4,

        excerpt:
          "Internal correspondence refers to John Smith as controlling ACME operations.",
      },
    ],
  },

  {
    id: "flag-002",

    title:
      "Unusual payment pattern",

    description:
      "Multiple high-value transfers appear clustered around company registration changes.",

    detectionType:
      "Unusual Payment Pattern",

    severity:
      "HIGH",

    status:
      "OPEN",

    confidence:
      0.87,

    createdAt:
      "Mar 20, 2026",

    evidence: [
      {
        id:
          "fe-004",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "Several high-value payments were processed within a short period.",
      },

      {
        id:
          "fe-005",

        evidenceId:
          "ev-004",

        file:
          "registry.pdf",

        page:
          7,

        excerpt:
          "Corporate registration information changed during the same period.",
      },
    ],
  },

  {
    id: "flag-003",

    title:
      "Conflicting testimony",

    description:
      "John Smith's interview statement conflicts with corporate registry records.",

    detectionType:
      "Conflicting Statements",

    severity:
      "HIGH",

    status:
      "REVIEWED",

    confidence:
      0.91,

    createdAt:
      "Mar 21, 2026",

    reviewNotes:
      "Registry evidence confirms a conflict with the interview statement.",

    evidence: [
      {
        id:
          "fe-006",

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
          "fe-007",

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
    id: "flag-004",

    title:
      "Timeline inconsistency",

    description:
      "The stated payment authorization date occurs after the recorded transaction date.",

    detectionType:
      "Date Inconsistency",

    severity:
      "MEDIUM",

    status:
      "OPEN",

    confidence:
      0.79,

    createdAt:
      "Apr 2, 2026",

    evidence: [
      {
        id:
          "fe-008",

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
          "fe-009",

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

  {
    id: "flag-005",

    title:
      "Missing payment documentation",

    description:
      "No contract or invoice was found for one of the reviewed payments.",

    detectionType:
      "Missing Documentation",

    severity:
      "LOW",

    status:
      "DISMISSED",

    confidence:
      0.73,

    createdAt:
      "Apr 4, 2026",

    reviewNotes:
      "Investigator determined the document existed under a different evidence record.",

    evidence: [
      {
        id:
          "fe-010",

        evidenceId:
          "ev-003",

        file:
          "transactions.csv",

        page:
          1,

        excerpt:
          "Payment entry initially appeared to have no linked invoice.",
      },
    ],
  },
];

/* =========================================================
   OPTIONS
========================================================= */

const severityOptions: Array<
  "ALL" | FlagSeverity
> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const statusOptions: Array<
  "ALL" | FlagStatus
> = [
  "ALL",
  "OPEN",
  "REVIEWED",
  "DISMISSED",
  "CONVERTED",
];

/* =========================================================
   PAGE
========================================================= */

export default function FlagsPage() {
  const { caseId } =
    useParams<{
      caseId: string;
    }>();

  const [
    flags,
    setFlags,
  ] =
    useState<FlagItem[]>(
      initialFlags,
    );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    severityFilter,
    setSeverityFilter,
  ] =
    useState<
      "ALL" | FlagSeverity
    >("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "ALL" | FlagStatus
    >("ALL");

  const [
    severityOpen,
    setSeverityOpen,
  ] =
    useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const [
    selectedFlagId,
    setSelectedFlagId,
  ] =
    useState<string | null>(
      initialFlags[3]?.id ??
        null,
    );

  const [
    dismissFlag,
    setDismissFlag,
  ] =
    useState<FlagItem | null>(
      null,
    );

  const [
    convertFlag,
    setConvertFlag,
  ] =
    useState<FlagItem | null>(
      null,
    );

  /* =========================================================
     SELECTED FLAG
  ========================================================= */

  const selectedFlag =
    flags.find(
      (flag) =>
        flag.id ===
        selectedFlagId,
    ) ?? null;

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredFlags =
    useMemo(() => {
      return flags.filter(
        (flag) => {
          const searchValue =
            query
              .toLowerCase()
              .trim();

          const matchesSearch =
            flag.title
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            flag.description
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            flag.detectionType
              .toLowerCase()
              .includes(
                searchValue,
              );

          const matchesSeverity =
            severityFilter ===
              "ALL" ||
            flag.severity ===
              severityFilter;

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            flag.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesSeverity &&
            matchesStatus
          );
        },
      );
    }, [
      flags,
      query,
      severityFilter,
      statusFilter,
    ]);

  /* =========================================================
     DISMISS
  ========================================================= */

  function handleDismiss(
    flagId: string,
    notes: string,
  ) {
    setFlags(
      (current) =>
        current.map(
          (flag) =>
            flag.id ===
            flagId
              ? {
                  ...flag,

                  status:
                    "DISMISSED",

                  reviewNotes:
                    notes,
                }
              : flag,
        ),
    );

    setDismissFlag(
      null,
    );

    /*
      Later backend:

      POST /cases/{caseId}/flags/{flagId}/dismiss

      {
        notes: "..."
      }
    */
  }

  /* =========================================================
     MARK REVIEWED
  ========================================================= */

  function handleMarkReviewed(
    flagId: string,
  ) {
    setFlags(
      (current) =>
        current.map(
          (flag) =>
            flag.id ===
            flagId
              ? {
                  ...flag,

                  status:
                    "REVIEWED",
                }
              : flag,
        ),
    );

    /*
      Later:

      POST /cases/{caseId}/flags/{flagId}/review
    */
  }

  /* =========================================================
     CONVERT TO FINDING
  ========================================================= */

  function handleConvertToFinding(
    flagId: string,
    findingTitle: string,
    findingDescription: string,
  ) {
    const findingId =
      `finding-${Date.now()}`;

    setFlags(
      (current) =>
        current.map(
          (flag) =>
            flag.id ===
            flagId
              ? {
                  ...flag,

                  status:
                    "CONVERTED",

                  findingId,
                }
              : flag,
        ),
    );

    setConvertFlag(
      null,
    );

    /*
      Later backend:

      POST /cases/{caseId}/findings

      {
        sourceFlagId: flagId,
        title: findingTitle,
        description: findingDescription,
        status: "DRAFT"
      }

      IMPORTANT:
      Converted flag -> DRAFT finding.
      NOT automatically VERIFIED.
    */

    console.log(
      findingTitle,
      findingDescription,
    );
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
          <div className="mx-auto flex max-w-[1380px] items-end justify-between">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Flags
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Review potential
                investigative issues
                detected across case
                evidence.
              </p>
            </div>

            <div className="text-xs text-[#87918C]">
              {
                filteredFlags.length
              }{" "}
              {filteredFlags.length ===
              1
                ? "flag"
                : "flags"}
            </div>
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 pb-7">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[minmax(0,1fr)_370px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                FLAGS LIST
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
                    placeholder="Search flags..."
                    className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                  />
                </div>

                {/* SEVERITY FILTER */}

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
                        | FlagSeverity,
                    );

                    setSeverityOpen(
                      false,
                    );
                  }}
                  allLabel="All severities"
                />

                {/* STATUS FILTER */}

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
                        | FlagStatus,
                    );

                    setStatusOpen(
                      false,
                    );
                  }}
                  allLabel="All statuses"
                />
              </div>

              {/* FLAGS */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredFlags.map(
                  (
                    flag,
                  ) => (
                    <FlagRow
                      key={
                        flag.id
                      }
                      flag={
                        flag
                      }
                      selected={
                        flag.id ===
                        selectedFlagId
                      }
                      onClick={() =>
                        setSelectedFlagId(
                          flag.id,
                        )
                      }
                    />
                  ),
                )}
              </div>
            </section>

            {/* =============================================
                FLAG DETAILS
            ============================================= */}

            <aside className="min-h-0 border-l border-[#E6E8E4] bg-[#FCFCFA]">
              {selectedFlag ? (
                <FlagDetailPanel
                  flag={
                    selectedFlag
                  }
                  caseId={
                    caseId
                  }
                  onClose={() =>
                    setSelectedFlagId(
                      null,
                    )
                  }
                  onDismiss={() =>
                    setDismissFlag(
                      selectedFlag,
                    )
                  }
                  onMarkReviewed={() =>
                    handleMarkReviewed(
                      selectedFlag.id,
                    )
                  }
                  onConvert={() =>
                    setConvertFlag(
                      selectedFlag,
                    )
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <Flag
                      size={
                        27
                      }
                      className="mx-auto text-[#A4ACA8]"
                    />

                    <div className="mt-3 text-sm font-semibold text-[#44504A]">
                      Select a flag
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#8C9590]">
                      Choose a flag to
                      inspect the
                      detection and
                      supporting
                      evidence.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* DISMISS MODAL */}

        {dismissFlag && (
          <DismissFlagModal
            flag={
              dismissFlag
            }
            onClose={() =>
              setDismissFlag(
                null,
              )
            }
            onDismiss={(
              notes,
            ) =>
              handleDismiss(
                dismissFlag.id,
                notes,
              )
            }
          />
        )}

        {/* CONVERT MODAL */}

        {convertFlag && (
          <ConvertToFindingModal
            flag={
              convertFlag
            }
            onClose={() =>
              setConvertFlag(
                null,
              )
            }
            onConvert={(
              title,
              description,
            ) =>
              handleConvertToFinding(
                convertFlag.id,
                title,
                description,
              )
            }
          />
        )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   FLAG ROW
========================================================= */

function FlagRow({
  flag,
  selected,
  onClick,
}: {
  flag: FlagItem;

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
          ? "bg-[#F5F6F2]"
          : flag.status ===
            "DISMISSED"
          ? "bg-[#FCFCFA] opacity-70"
          : "bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* ICON */}

        <FlagSeverityIcon
          severity={
            flag.severity
          }
        />

        <div className="min-w-0 flex-1">
          {/* BADGES */}

          <div className="flex items-center gap-2">
            <SeverityBadge
              severity={
                flag.severity
              }
            />

            <FlagStatusBadge
              status={
                flag.status
              }
            />

            <span className="ml-auto text-xs font-semibold text-[#45524B]">
              {Math.round(
                flag.confidence *
                  100,
              )}
              %
            </span>
          </div>

          {/* TITLE */}

          <h3 className="mt-3 text-[15px] font-semibold text-[#26312C]">
            {
              flag.title
            }
          </h3>

          {/* DESCRIPTION */}

          <p className="mt-2 text-sm leading-6 text-[#707B75]">
            {
              flag.description
            }
          </p>

          {/* META */}

          <div className="mt-4 flex items-center gap-5 text-[11px] text-[#89928D]">
            <span>
              {
                flag.detectionType
              }
            </span>

            <span>
              {
                flag.evidence
                  .length
              }{" "}
              {flag.evidence.length ===
              1
                ? "evidence source"
                : "evidence sources"}
            </span>

            <span className="ml-auto">
              {
                flag.createdAt
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

function FlagDetailPanel({
  flag,
  caseId,
  onClose,
  onDismiss,
  onMarkReviewed,
  onConvert,
}: {
  flag: FlagItem;

  caseId: string;

  onClose: () => void;

  onDismiss: () => void;

  onMarkReviewed: () => void;

  onConvert: () => void;
}) {
  const primaryEvidence =
    flag.evidence[0];

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="shrink-0 border-b border-[#E7E9E5] bg-white p-6">
        <div className="flex items-center justify-between">
          <SectionLabel label="Flag Details" />

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

        <div className="mt-5 flex items-start gap-3">
          <FlagSeverityIcon
            severity={
              flag.severity
            }
            large
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge
                severity={
                  flag.severity
                }
              />

              <FlagStatusBadge
                status={
                  flag.status
                }
              />
            </div>

            <h3 className="mt-3 text-[17px] font-semibold leading-6 text-[#26312C]">
              {
                flag.title
              }
            </h3>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* DETECTION TYPE */}

        <SectionLabel label="Detection Type" />

        <div className="mt-2 text-sm font-medium text-[#45524B]">
          {
            flag.detectionType
          }
        </div>

        {/* DESCRIPTION */}

        <div className="mt-7">
          <SectionLabel label="Description" />

          <p className="mt-2 text-sm leading-6 text-[#626E68]">
            {
              flag.description
            }
          </p>
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
                    flag.confidence *
                    100
                  }%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-[#0F4C3A]">
              {Math.round(
                flag.confidence *
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
            {flag.evidence.map(
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

        {/* INFO */}

        <div className="mt-7 rounded-xl border border-[#E6E8E4] bg-[#FAFAF7] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={
                16
              }
              className="mt-0.5 shrink-0 text-[#A67C2D]"
            />

            <p className="text-xs leading-5 text-[#6F7A74]">
              A flag indicates
              potential
              investigative
              significance. It
              should be reviewed
              before being treated
              as a formal finding.
            </p>
          </div>
        </div>

        {/* REVIEW NOTES */}

        {flag.reviewNotes && (
          <div className="mt-7">
            <SectionLabel label="Review Notes" />

            <div className="mt-3 rounded-lg border border-[#E6E8E4] bg-[#FAFAF7] p-4 text-xs leading-5 text-[#66716B]">
              {
                flag.reviewNotes
              }
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      <div className="shrink-0 border-t border-[#E7E9E5] bg-white p-5">
        {flag.status ===
          "OPEN" && (
          <div className="space-y-3">
            {/* SOURCE */}

            {primaryEvidence && (
              <Link
                href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#0F4C3A] transition hover:bg-[#F3F7F4]"
              >
                Open Evidence
              </Link>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={
                  onDismiss
                }
                className="h-10 rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
              >
                Dismiss
              </button>

              <button
                type="button"
                onClick={
                  onMarkReviewed
                }
                className="h-10 rounded-lg border border-[#C8D6CE] bg-[#F4F8F5] text-sm font-medium text-[#0F4C3A] transition hover:bg-[#EDF4EF]"
              >
                Reviewed
              </button>

              <button
                type="button"
                onClick={
                  onConvert
                }
                className="h-10 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
              >
                Convert
              </button>
            </div>
          </div>
        )}

        {/* REVIEWED */}

        {flag.status ===
          "REVIEWED" && (
          <div className="space-y-3">
            {primaryEvidence && (
              <Link
                href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#0F4C3A] hover:bg-[#F3F7F4]"
              >
                Open Evidence
              </Link>
            )}

            <button
              type="button"
              onClick={
                onConvert
              }
              className="h-10 w-full rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              Convert to Finding
            </button>
          </div>
        )}

        {/* DISMISSED */}

        {flag.status ===
          "DISMISSED" && (
          <div className="space-y-3">
            {primaryEvidence && (
              <Link
                href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#0F4C3A] hover:bg-[#F3F7F4]"
              >
                Open Evidence
              </Link>
            )}

            <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F0F1ED] text-sm font-medium text-[#6F7873]">
              <Check
                size={
                  14
                }
              />

              Dismissed
            </div>
          </div>
        )}

        {/* CONVERTED */}

        {flag.status ===
          "CONVERTED" && (
          <div className="space-y-3">
            {primaryEvidence && (
              <Link
                href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#0F4C3A] hover:bg-[#F3F7F4]"
              >
                Open Evidence
              </Link>
            )}

            {flag.findingId && (
              <Link
                href={`/cases/${caseId}/findings`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white hover:bg-[#0A382B]"
              >
                <CheckCircle2
                  size={
                    15
                  }
                />

                Open Finding
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DISMISS MODAL
========================================================= */

function DismissFlagModal({
  flag,
  onClose,
  onDismiss,
}: {
  flag: FlagItem;

  onClose: () => void;

  onDismiss: (
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
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Dismiss Flag
            </div>

            <h2 className="mt-2 text-[22px] font-semibold text-[#18201D]">
              Dismiss this flag?
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              The flag will
              remain available
              in the audit
              history.
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
              size={16}
            />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <div className="rounded-xl border border-[#E6E8E4] bg-[#FAFAF7] p-4">
            <div className="text-sm font-semibold text-[#35413B]">
              {
                flag.title
              }
            </div>

            <p className="mt-2 text-xs leading-5 text-[#76817B]">
              {
                flag.description
              }
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-[#35413B]">
              Reason for
              dismissal
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
              placeholder="Explain why this flag does not require escalation..."
              className="mt-2 w-full resize-none rounded-lg border border-[#DDE1DC] px-4 py-3 text-sm outline-none focus:border-[#93AA9F]"
            />
          </div>

          <div className="mt-5 rounded-lg border border-[#F0E2C2] bg-[#FCF8EF] p-4 text-xs leading-5 text-[#776844]">
            Dismissal does
            not delete the
            flag or its source
            evidence. It only
            records that the
            investigator chose
            not to escalate it.
          </div>
        </div>

        {/* FOOTER */}

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
            onClick={() =>
              onDismiss(
                notes,
              )
            }
            className="h-10 rounded-lg bg-[#606A65] px-5 text-sm font-medium text-white hover:bg-[#505955]"
          >
            Dismiss Flag
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CONVERT TO FINDING MODAL
========================================================= */

function ConvertToFindingModal({
  flag,
  onClose,
  onConvert,
}: {
  flag: FlagItem;

  onClose: () => void;

  onConvert: (
    title: string,
    description: string,
  ) => void;
}) {
  const [
    title,
    setTitle,
  ] =
    useState(
      flag.title,
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      flag.description,
    );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Convert Flag
            </div>

            <h2 className="mt-2 text-[22px] font-semibold text-[#18201D]">
              Convert to finding
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Create a draft
              investigator
              finding from this
              flag.
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
              size={16}
            />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <label className="text-sm font-medium text-[#35413B]">
            Finding title
          </label>

          <input
            value={
              title
            }
            onChange={(
              event,
            ) =>
              setTitle(
                event
                  .target
                  .value,
              )
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] px-4 text-sm outline-none focus:border-[#93AA9F]"
          />

          <div className="mt-5">
            <label className="text-sm font-medium text-[#35413B]">
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event
                    .target
                    .value,
                )
              }
              rows={5}
              className="mt-2 w-full resize-none rounded-lg border border-[#DDE1DC] px-4 py-3 text-sm outline-none focus:border-[#93AA9F]"
            />
          </div>

          <div className="mt-5 rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={
                  17
                }
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <p className="text-xs leading-5 text-[#75817A]">
                This action
                creates a{" "}
                <strong>
                  DRAFT finding
                </strong>
                . It is not
                automatically a
                verified
                conclusion.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}

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
              !title.trim() ||
              !description.trim()
            }
            onClick={() =>
              onConvert(
                title.trim(),
                description.trim(),
              )
            }
            className="h-10 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Draft Finding
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DROPDOWN
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
   SEVERITY ICON
========================================================= */

function FlagSeverityIcon({
  severity,
  large = false,
}: {
  severity:
    FlagSeverity;

  large?: boolean;
}) {
  const styles: Record<
    FlagSeverity,
    string
  > = {
    CRITICAL:
      "bg-[#FBEAE8] text-[#C5564B]",

    HIGH:
      "bg-[#F8EFE1] text-[#C17E29]",

    MEDIUM:
      "bg-[#F5F1E2] text-[#A08028]",

    LOW:
      "bg-[#EDF1EE] text-[#68756E]",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${styles[severity]} ${
        large
          ? "h-11 w-11"
          : "h-10 w-10"
      }`}
    >
      <ShieldAlert
        size={
          large
            ? 18
            : 16
        }
      />
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function FlagStatusBadge({
  status,
}: {
  status:
    FlagStatus;
}) {
  const styles: Record<
    FlagStatus,
    string
  > = {
    OPEN:
      "bg-[#EAF0F6] text-[#55718D]",

    REVIEWED:
      "bg-[#E7F2EC] text-[#19704F]",

    DISMISSED:
      "bg-[#EFEFEB] text-[#737A76]",

    CONVERTED:
      "bg-[#EAEAF3] text-[#646185]",
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

