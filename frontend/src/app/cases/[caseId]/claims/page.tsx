"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { SectionLabel } from "@/components/ui/section-label";
import { SummaryCard } from "@/components/ui/summary-card";
import { DecisionCard } from "@/components/ui/decision-card";

import { formatLabel } from "@/lib/formatters";

import {
  Check,
  ChevronDown,
  FileText,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type ClaimStatus =
  | "UNVERIFIED"
  | "SUPPORTED"
  | "CONTRADICTED"
  | "DISPUTED"
  | "VERIFIED";

type ClaimEvidenceType =
  | "SUPPORTS"
  | "CONTRADICTS";

type ClaimEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;

  type: ClaimEvidenceType;
};

type ClaimItem = {
  id: string;

  text: string;

  speaker: string;

  claimType: string;

  confidence: number;

  status: ClaimStatus;

  date: string;

  supportingCount: number;

  contradictingCount: number;

  evidence: ClaimEvidence[];

  reviewNotes?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialClaims: ClaimItem[] = [
  {
    id: "claim-001",

    text:
      "I never worked for ACME Ltd.",

    speaker:
      "John Smith",

    claimType:
      "Employment",

    confidence:
      0.94,

    status:
      "CONTRADICTED",

    date:
      "Mar 14, 2026",

    supportingCount:
      0,

    contradictingCount:
      2,

    evidence: [
      {
        id:
          "ce-001",

        evidenceId:
          "ev-004",

        file:
          "company_registry.pdf",

        page:
          7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd.",

        type:
          "CONTRADICTS",
      },

      {
        id:
          "ce-002",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          12,

        excerpt:
          "The agreement identifies John Smith as acting on behalf of ACME Ltd.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-002",

    text:
      "The payment was for consulting services.",

    speaker:
      "Sarah Miller",

    claimType:
      "Payment Purpose",

    confidence:
      0.82,

    status:
      "DISPUTED",

    date:
      "Mar 16, 2026",

    supportingCount:
      1,

    contradictingCount:
      1,

    evidence: [
      {
        id:
          "ce-003",

        evidenceId:
          "ev-002",

        file:
          "contract_acme.pdf",

        page:
          9,

        excerpt:
          "Consulting services are referenced in the agreement.",

        type:
          "SUPPORTS",
      },

      {
        id:
          "ce-004",

        evidenceId:
          "ev-001",

        file:
          "bank_statement.pdf",

        page:
          12,

        excerpt:
          "The transfer description does not identify a consulting invoice or service reference.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-003",

    text:
      "I was not aware of this account.",

    speaker:
      "John Smith",

    claimType:
      "Account Knowledge",

    confidence:
      0.77,

    status:
      "UNVERIFIED",

    date:
      "Mar 18, 2026",

    supportingCount:
      0,

    contradictingCount:
      0,

    evidence: [
      {
        id:
          "ce-005",

        evidenceId:
          "ev-006",

        file:
          "interview_notes.pdf",

        page:
          5,

        excerpt:
          "John Smith stated that he was not aware of Account 3281.",

        type:
          "SUPPORTS",
      },
    ],
  },

  {
    id:
      "claim-004",

    text:
      "ACME Ltd had no offshore subsidiaries.",

    speaker:
      "ACME Ltd",

    claimType:
      "Corporate Structure",

    confidence:
      0.91,

    status:
      "CONTRADICTED",

    date:
      "Apr 2, 2026",

    supportingCount:
      0,

    contradictingCount:
      1,

    evidence: [
      {
        id:
          "ce-006",

        evidenceId:
          "ev-011",

        file:
          "offshore_registry.pdf",

        page:
          4,

        excerpt:
          "Registry records identify Global Holdings as an offshore subsidiary linked to ACME Ltd.",

        type:
          "CONTRADICTS",
      },
    ],
  },

  {
    id:
      "claim-005",

    text:
      "All payments were properly authorized.",

    speaker:
      "Sarah Miller",

    claimType:
      "Authorization",

    confidence:
      0.85,

    status:
      "SUPPORTED",

    date:
      "Apr 4, 2026",

    supportingCount:
      1,

    contradictingCount:
      0,

    evidence: [
      {
        id:
          "ce-007",

        evidenceId:
          "ev-012",

        file:
          "approval_email.pdf",

        page:
          2,

        excerpt:
          "Email approval recorded before the payment date.",

        type:
          "SUPPORTS",
      },
    ],
  },
];

const statusOptions: Array<
  "ALL" | ClaimStatus
> = [
  "ALL",
  "UNVERIFIED",
  "SUPPORTED",
  "CONTRADICTED",
  "DISPUTED",
  "VERIFIED",
];

/* =========================================================
   PAGE
========================================================= */

export default function ClaimsPage() {
  const { caseId } =
    useParams<{
      caseId: string;
    }>();

  const [
    claims,
    setClaims,
  ] =
    useState<ClaimItem[]>(
      initialClaims,
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
      "ALL" | ClaimStatus
    >("ALL");

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const [
    selectedClaimId,
    setSelectedClaimId,
  ] =
    useState<string | null>(
      initialClaims[4]?.id ??
        null,
    );

  const [
    reviewClaim,
    setReviewClaim,
  ] =
    useState<ClaimItem | null>(
      null,
    );

  /* =========================================================
     SELECTED CLAIM
  ========================================================= */

  const selectedClaim =
    claims.find(
      (claim) =>
        claim.id ===
        selectedClaimId,
    ) ?? null;

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredClaims =
    useMemo(() => {
      return claims.filter(
        (claim) => {
          const searchValue =
            query
              .toLowerCase()
              .trim();

          const matchesSearch =
            claim.text
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            claim.speaker
              .toLowerCase()
              .includes(
                searchValue,
              ) ||
            claim.claimType
              .toLowerCase()
              .includes(
                searchValue,
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            claim.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      claims,
      query,
      statusFilter,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const contradictedCount =
    claims.filter(
      (claim) =>
        claim.status ===
        "CONTRADICTED",
    ).length;

  const disputedCount =
    claims.filter(
      (claim) =>
        claim.status ===
        "DISPUTED",
    ).length;

  const unverifiedCount =
    claims.filter(
      (claim) =>
        claim.status ===
        "UNVERIFIED",
    ).length;

  /* =========================================================
     REVIEW SAVE
  ========================================================= */

  function handleReviewSave(
    data: {
      claimId: string;

      decision:
        | "SUPPORTED"
        | "CONTRADICTED"
        | "DISPUTED"
        | "VERIFIED";

      notes: string;
    },
  ) {
    setClaims(
      (current) =>
        current.map(
          (claim) =>
            claim.id ===
            data.claimId
              ? {
                  ...claim,

                  status:
                    data.decision,

                  reviewNotes:
                    data.notes,
                }
              : claim,
        ),
    );

    setReviewClaim(null);
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
              Claims
            </h2>

            <p className="mt-1 text-sm text-[#7A8580]">
              Review statements
              and assertions
              extracted from case
              evidence.
            </p>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="shrink-0 px-8">
          <div className="mx-auto grid max-w-[1380px] grid-cols-4 gap-4">
            <SummaryCard
              label="Total Claims"
              value={
                claims.length
              }
            />

            <SummaryCard
              label="Contradicted"
              value={
                contradictedCount
              }
              tone="danger"
            />

            <SummaryCard
              label="Disputed"
              value={
                disputedCount
              }
              tone="warning"
            />

            <SummaryCard
              label="Unverified"
              value={
                unverifiedCount
              }
              tone="neutral"
            />
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 pb-7 pt-5">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[minmax(0,1fr)_360px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                CLAIMS LIST
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
                    placeholder="Search claims or speakers..."
                    className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                  />
                </div>

                {/* STATUS */}

                <div className="relative z-[60]">
                  <button
                    type="button"
                    onClick={() =>
                      setStatusOpen(
                        (
                          open,
                        ) =>
                          !open,
                      )
                    }
                    className="flex h-10 min-w-[170px] items-center justify-between gap-4 rounded-lg border border-[#DFE3DE] bg-white px-4 text-sm text-[#59645F]"
                  >
                    {statusFilter ===
                    "ALL"
                      ? "All statuses"
                      : formatLabel(
                          statusFilter,
                        )}

                    <ChevronDown
                      size={
                        15
                      }
                      className={`transition ${
                        statusOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {statusOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-[999] w-[190px] rounded-xl border border-[#E1E4DF] bg-white p-1.5 shadow-xl">
                      {statusOptions.map(
                        (
                          item,
                        ) => (
                          <button
                            key={
                              item
                            }
                            type="button"
                            onClick={() => {
                              setStatusFilter(
                                item,
                              );

                              setStatusOpen(
                                false,
                              );
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              statusFilter ===
                              item
                                ? "bg-[#EEF3F0] font-medium text-[#0F4C3A]"
                                : "text-[#59645F] hover:bg-[#F3F5F1]"
                            }`}
                          >
                            {item ===
                            "ALL"
                              ? "All statuses"
                              : formatLabel(
                                  item,
                                )}

                            {statusFilter ===
                              item && (
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
              </div>

              {/* CLAIMS */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredClaims.length >
                0 ? (
                  filteredClaims.map(
                    (
                      claim,
                    ) => (
                      <ClaimRow
                        key={
                          claim.id
                        }
                        claim={
                          claim
                        }
                        selected={
                          claim.id ===
                          selectedClaimId
                        }
                        onClick={() =>
                          setSelectedClaimId(
                            claim.id,
                          )
                        }
                      />
                    ),
                  )
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center text-center">
                    <div>
                      <MessageSquareQuote
                        size={
                          27
                        }
                        className="mx-auto text-[#A4ACA8]"
                      />

                      <div className="mt-3 text-sm font-semibold text-[#44504A]">
                        No claims
                        found
                      </div>

                      <p className="mt-1 text-xs text-[#8D9691]">
                        Try
                        changing
                        your
                        search or
                        status
                        filter.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =============================================
                CLAIM DETAILS
            ============================================= */}

            <aside className="min-h-0 border-l border-[#E6E8E4] bg-[#FCFCFA]">
              {selectedClaim ? (
                <ClaimDetailPanel
                  claim={
                    selectedClaim
                  }
                  caseId={
                    caseId
                  }
                  onClose={() =>
                    setSelectedClaimId(
                      null,
                    )
                  }
                  onReview={() =>
                    setReviewClaim(
                      selectedClaim,
                    )
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <MessageSquareQuote
                      size={
                        27
                      }
                      className="mx-auto text-[#A4ACA8]"
                    />

                    <div className="mt-3 text-sm font-semibold text-[#44504A]">
                      Select a
                      claim
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#8C9590]">
                      Select a
                      statement
                      to review
                      its evidence
                      and status.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* =================================================
            REVIEW CLAIM MODAL
        ================================================= */}

        {reviewClaim && (
          <ReviewClaimModal
            claim={
              reviewClaim
            }
            onClose={() =>
              setReviewClaim(
                null,
              )
            }
            onSave={
              handleReviewSave
            }
          />
        )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   CLAIM ROW
========================================================= */

function ClaimRow({
  claim,
  selected,
  onClick,
}: {
  claim: ClaimItem;

  selected: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b border-[#ECEDE9] px-6 py-5 text-left transition ${
        selected
          ? "bg-[#F4F6F3]"
          : "bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* ICON */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F0] text-[#0F4C3A]">
          <MessageSquareQuote
            size={17}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* CLAIM */}

          <div className="flex items-start justify-between gap-4">
            <div className="text-[15px] font-semibold leading-6 text-[#20302A]">
              &ldquo;
              {claim.text}
              &rdquo;
            </div>

            <ClaimStatusBadge
              status={
                claim.status
              }
            />
          </div>

          {/* SPEAKER */}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <User
              size={
                12
              }
              className="text-[#8D9691]"
            />

            <span className="font-medium text-[#0F4C3A]">
              {
                claim.speaker
              }
            </span>

            <span className="text-[#B4BAB7]">
              |
            </span>

            <span className="text-[#67736D]">
              {
                claim.claimType
              }
            </span>
          </div>

          {/* META */}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#7D8782]">
            <span>
              Confidence{" "}
              <strong className="font-semibold text-[#425049]">
                {Math.round(
                  claim.confidence *
                    100,
                )}
                %
              </strong>
            </span>

            <span>
              Supporting{" "}
              <strong className="font-semibold text-[#19704F]">
                {
                  claim.supportingCount
                }
              </strong>
            </span>

            <span>
              Contradicting{" "}
              <strong className="font-semibold text-[#B64D42]">
                {
                  claim.contradictingCount
                }
              </strong>
            </span>

            <span className="ml-auto">
              {
                claim.date
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

function ClaimDetailPanel({
  claim,
  caseId,
  onClose,
  onReview,
}: {
  claim: ClaimItem;

  caseId: string;

  onClose: () => void;

  onReview: () => void;
}) {
  const primaryEvidence =
    claim.evidence[0];

  const needsReview =
    claim.status ===
    "UNVERIFIED";

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="shrink-0 border-b border-[#E7E9E5] bg-white p-6">
        <div className="flex items-center justify-between">
          <SectionLabel label="Claim Details" />

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
          >
            <X
              size={15}
            />
          </button>
        </div>

        <h3 className="mt-5 text-[17px] font-semibold leading-6 text-[#20302A]">
          &ldquo;
          {
            claim.text
          }
          &rdquo;
        </h3>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF3F0] text-[#0F4C3A]">
              <User
                size={14}
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-[#35413B]">
                {
                  claim.speaker
                }
              </div>

              <div className="mt-0.5 text-[10px] text-[#929A96]">
                Speaker
              </div>
            </div>
          </div>

          <ClaimStatusBadge
            status={
              claim.status
            }
          />
        </div>
      </div>

      {/* BODY */}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {/* CLAIM TYPE */}

        <SectionLabel label="Claim Type" />

        <div className="mt-2 text-sm font-medium text-[#45524B]">
          {
            claim.claimType
          }
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
                    claim.confidence *
                    100
                  }%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-[#0F4C3A]">
              {Math.round(
                claim.confidence *
                  100,
              )}
              %
            </span>
          </div>
        </div>

        {/* EVIDENCE */}

        <div className="mt-7">
          <SectionLabel label="Evidence" />

          <div className="mt-3 space-y-3">
            {claim.evidence.length >
            0 ? (
              claim.evidence.map(
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

                    <div className="mt-3">
                      <EvidenceTypeBadge
                        type={
                          evidence.type
                        }
                      />
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
                        Open
                        evidence →
                      </Link>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="rounded-lg border border-dashed border-[#DDE2DD] bg-[#FAFAF7] p-4 text-xs text-[#8A938E]">
                No linked
                evidence yet.
              </div>
            )}
          </div>
        </div>

        {/* REVIEW NOTES */}

        {claim.reviewNotes && (
          <div className="mt-7">
            <SectionLabel label="Review Notes" />

            <div className="mt-3 rounded-lg border border-[#E5E8E4] bg-[#FAFAF7] p-4 text-xs leading-5 text-[#68736E]">
              {
                claim.reviewNotes
              }
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="shrink-0 border-t border-[#E7E9E5] bg-white p-5">
        <div className="grid grid-cols-2 gap-3">
          {/* REVIEW BUTTON */}

          {needsReview ? (
            <button
              type="button"
              onClick={
                onReview
              }
              className="h-10 rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#0F4C3A] transition hover:bg-[#F3F7F4]"
            >
              Review Claim
            </button>
          ) : (
            <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#E1E4DF] bg-[#F7F8F5] text-sm font-medium text-[#69746E]">
              <Check
                size={
                  14
                }
                className="text-[#19704F]"
              />

              Reviewed
            </div>
          )}

          {/* OPEN EVIDENCE */}

          {primaryEvidence ? (
            <Link
              href={`/cases/${caseId}/evidence/${primaryEvidence.evidenceId}?page=${primaryEvidence.page}`}
              className="flex h-10 items-center justify-center rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              Open Evidence
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="h-10 cursor-not-allowed rounded-lg bg-[#DDE1DD] text-sm font-medium text-[#8C9590]"
            >
              No Evidence
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW CLAIM MODAL
========================================================= */

function ReviewClaimModal({
  claim,
  onClose,
  onSave,
}: {
  claim: ClaimItem;

  onClose: () => void;

  onSave: (
    data: {
      claimId: string;

      decision:
        | "SUPPORTED"
        | "CONTRADICTED"
        | "DISPUTED"
        | "VERIFIED";

      notes: string;
    },
  ) => void;
}) {
  const [
    decision,
    setDecision,
  ] = useState<
    | "SUPPORTED"
    | "CONTRADICTED"
    | "DISPUTED"
    | "VERIFIED"
  >("VERIFIED");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  function handleSave() {
    onSave({
      claimId:
        claim.id,

      decision,

      notes,
    });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[650px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Claim Review
            </div>

            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Review claim
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Review the
              extracted claim
              against its
              supporting and
              contradicting
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

        {/* CLAIM */}

        <div className="border-b border-[#ECEDE9] bg-[#FAFAF7] px-7 py-5">
          <div className="text-[15px] font-semibold leading-6 text-[#29342F]">
            &ldquo;
            {
              claim.text
            }
            &rdquo;
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-[#7C8781]">
            <span className="font-medium text-[#0F4C3A]">
              {
                claim.speaker
              }
            </span>

            <span>
              ·
            </span>

            <span>
              {
                claim.claimType
              }
            </span>

            <span>
              ·
            </span>

            <span>
              {Math.round(
                claim.confidence *
                  100,
              )}
              % model
              confidence
            </span>
          </div>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <div className="text-sm font-semibold text-[#35413B]">
            Review decision
          </div>

          <p className="mt-1 text-xs text-[#89928D]">
            Choose the
            investigator-reviewed
            status for this
            claim.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <DecisionCard
              title="Supported"
              description="Evidence supports the assertion."
              selected={
                decision ===
                "SUPPORTED"
              }
              onClick={() =>
                setDecision(
                  "SUPPORTED",
                )
              }
            />

            <DecisionCard
              title="Contradicted"
              description="Evidence contradicts the assertion."
              selected={
                decision ===
                "CONTRADICTED"
              }
              onClick={() =>
                setDecision(
                  "CONTRADICTED",
                )
              }
            />

            <DecisionCard
              title="Disputed"
              description="Evidence is conflicting or inconclusive."
              selected={
                decision ===
                "DISPUTED"
              }
              onClick={() =>
                setDecision(
                  "DISPUTED",
                )
              }
            />

            <DecisionCard
              title="Verified"
              description="Investigator has independently verified the claim."
              selected={
                decision ===
                "VERIFIED"
              }
              onClick={() =>
                setDecision(
                  "VERIFIED",
                )
              }
            />
          </div>

          {/* NOTES */}

          <div className="mt-6">
            <label className="block text-sm font-medium text-[#35413B]">
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
              placeholder="Explain the review decision..."
              className="mt-2 w-full resize-none rounded-lg border border-[#DDE1DC] bg-white px-4 py-3 text-sm text-[#18201D] outline-none placeholder:text-[#A1A8A4] focus:border-[#93AA9F]"
            />
          </div>

          {/* INFO */}

          <div className="mt-6 rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={
                  17
                }
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <div>
                <div className="text-xs font-semibold text-[#405048]">
                  Human-reviewed
                  status
                </div>

                <p className="mt-1 text-xs leading-5 text-[#75817A]">
                  The claim
                  status should
                  reflect the
                  evidence review,
                  not the model
                  confidence
                  score alone.
                </p>
              </div>
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
            className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F] hover:bg-[#F3F4F0]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B]"
          >
            <Check
              size={
                15
              }
            />

            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CLAIM STATUS
========================================================= */

function ClaimStatusBadge({
  status,
}: {
  status: ClaimStatus;
}) {
  const styles: Record<
    ClaimStatus,
    string
  > = {
    UNVERIFIED:
      "bg-[#F0F1ED] text-[#6D7671]",

    SUPPORTED:
      "bg-[#E7F2EC] text-[#19704F]",

    CONTRADICTED:
      "bg-[#F7E9E7] text-[#B64D42]",

    DISPUTED:
      "bg-[#F3F0E5] text-[#9A762E]",

    VERIFIED:
      "bg-[#E7EEF6] text-[#37688D]",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[status]}`}
    >
      {
        formatLabel(
          status,
        )
      }
    </span>
  );
}

/* =========================================================
   EVIDENCE BADGE
========================================================= */

function EvidenceTypeBadge({
  type,
}: {
  type:
    ClaimEvidenceType;
}) {
  if (
    type ===
    "SUPPORTS"
  ) {
    return (
      <span className="inline-flex rounded-md bg-[#E7F2EC] px-2 py-1 text-[9px] font-semibold tracking-[0.05em] text-[#19704F]">
        Supports
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md bg-[#F7E9E7] px-2 py-1 text-[9px] font-semibold tracking-[0.05em] text-[#B64D42]">
      Contradicts
    </span>
  );
}
