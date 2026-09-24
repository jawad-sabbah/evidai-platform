"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type ReportStatus =
  | "GENERATING"
  | "DRAFT"
  | "FINAL"
  | "FAILED";

type ReportType =
  | "FULL"
  | "EXECUTIVE"
  | "INTERIM"
  | "FINDINGS";

type FindingSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

type VerifiedFinding = {
  id: string;

  title: string;

  description: string;

  severity: FindingSeverity;
};

type ReportCitation = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  quotedText: string;
};

type ReportSection = {
  id: string;

  title: string;

  sectionType: string;

  order: number;

  content: string;

  citations: ReportCitation[];
};

type ReportItem = {
  id: string;

  title: string;

  reportType: ReportType;

  status: ReportStatus;

  generatedBy: string;

  generatedAt?: string;

  finalizedBy?: string;

  finalizedAt?: string;

  findingIds: string[];

  sections: ReportSection[];
};

/* =========================================================
   VERIFIED FINDINGS

   Later:
   GET /cases/{caseId}/findings?status=VERIFIED
========================================================= */

const verifiedFindings: VerifiedFinding[] = [
  {
    id: "finding-001",

    title:
      "Undisclosed ownership relationship with ACME Ltd",

    description:
      "Evidence indicates that John Smith maintained a significant control relationship with ACME Ltd.",

    severity: "CRITICAL",
  },

  {
    id: "finding-003",

    title:
      "Interview statement conflicts with registry evidence",

    description:
      "John Smith denied working for ACME Ltd while registry evidence identifies him as a director.",

    severity: "HIGH",
  },

  {
    id: "finding-005",

    title:
      "High-value transfers require additional explanation",

    description:
      "Multiple high-value transfers occurred without sufficient supporting documentation.",

    severity: "HIGH",
  },
];

/* =========================================================
   INITIAL REPORTS
========================================================= */

const initialReports: ReportItem[] = [
  {
    id: "report-001",

    title:
      "Investigation Report — Suspicious Payments",

    reportType: "FULL",

    status: "DRAFT",

    generatedBy: "Jawad Sabbah",

    generatedAt: "Sep 20, 2026",

    findingIds: [
      "finding-001",
      "finding-003",
    ],

    sections: [
      {
        id: "section-001",

        title:
          "Executive Summary",

        sectionType:
          "EXECUTIVE_SUMMARY",

        order: 1,

        content:
          "The investigation identified potentially significant financial activity, corporate relationships, and inconsistencies requiring further investigative review.",

        citations: [
          {
            id: "citation-001",

            evidenceId:
              "ev-004",

            file:
              "company_registry.pdf",

            page: 7,

            quotedText:
              "John Smith appears as a listed director of ACME Ltd.",
          },
        ],
      },

      {
        id: "section-002",

        title:
          "Investigation Scope",

        sectionType:
          "SCOPE",

        order: 2,

        content:
          "The investigation reviewed financial records, company registry documents, contracts, communications, extracted entities, relationships, events, and verified findings related to the case.",

        citations: [],
      },

      {
        id: "section-003",

        title:
          "Verified Findings",

        sectionType:
          "FINDINGS",

        order: 3,

        content:
          "The investigation identified an undisclosed corporate relationship involving John Smith and ACME Ltd. Additional inconsistencies were identified between statements made during interviews and available corporate registry evidence.",

        citations: [
          {
            id: "citation-002",

            evidenceId:
              "ev-002",

            file:
              "contract_acme.pdf",

            page: 12,

            quotedText:
              "Agreement references ownership and control rights.",
          },

          {
            id: "citation-003",

            evidenceId:
              "ev-004",

            file:
              "company_registry.pdf",

            page: 7,

            quotedText:
              "John Smith appears as a listed director of ACME Ltd.",
          },
        ],
      },

      {
        id: "section-004",

        title: "Conclusion",

        sectionType:
          "CONCLUSION",

        order: 4,

        content:
          "The verified findings and supporting evidence should be considered together with the complete investigation record before further investigative or procedural action is taken.",

        citations: [],
      },
    ],
  },

  {
    id: "report-002",

    title:
      "Interim Investigation Summary",

    reportType:
      "INTERIM",

    status: "FINAL",

    generatedBy:
      "Alex Morgan",

    generatedAt:
      "Sep 15, 2026",

    finalizedBy:
      "Sarah Reed",

    finalizedAt:
      "Sep 16, 2026",

    findingIds: [
      "finding-001",
    ],

    sections: [
      {
        id: "section-005",

        title: "Summary",

        sectionType:
          "SUMMARY",

        order: 1,

        content:
          "This interim report summarizes the first phase of the investigation and the reviewed evidence available at that stage.",

        citations: [],
      },
    ],
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ReportsPage() {
  const { caseId } =
    useParams<{
      caseId: string;
    }>();

  const [
    reports,
    setReports,
  ] =
    useState<ReportItem[]>(
      initialReports,
    );

  const [
    selectedReportId,
    setSelectedReportId,
  ] = useState<string | null>(
    initialReports[0]?.id ??
      null,
  );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    generateOpen,
    setGenerateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    finalizeOpen,
    setFinalizeOpen,
  ] = useState(false);

  /* =========================================================
     SELECTED REPORT
  ========================================================= */

  const selectedReport =
    reports.find(
      (report) =>
        report.id ===
        selectedReportId,
    ) ?? null;

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredReports =
    useMemo(() => {
      return reports.filter(
        (report) =>
          report.title
            .toLowerCase()
            .includes(
              query.toLowerCase(),
            ),
      );
    }, [reports, query]);

  /* =========================================================
     GENERATE
  ========================================================= */

  function handleGenerateReport(
    config: {
      title: string;

      reportType:
        ReportType;

      findingIds:
        string[];

      includeExecutiveSummary:
        boolean;

      includeScope:
        boolean;

      includeEntities:
        boolean;

      includeTimeline:
        boolean;

      includeFindings:
        boolean;

      includeEvidence:
        boolean;

      includeConclusion:
        boolean;
    },
  ) {
    const reportId =
      `report-${Date.now()}`;

    const generatingReport: ReportItem =
      {
        id: reportId,

        title:
          config.title,

        reportType:
          config.reportType,

        status:
          "GENERATING",

        generatedBy:
          "Jawad Sabbah",

        generatedAt:
          "Just now",

        findingIds:
          config.findingIds,

        sections: [],
      };

    setReports(
      (current) => [
        generatingReport,
        ...current,
      ],
    );

    setSelectedReportId(
      reportId,
    );

    setGenerateOpen(
      false,
    );

    /*
      Later:

      POST /cases/{caseId}/reports
    */

    setTimeout(() => {
      const selectedFindings =
        verifiedFindings.filter(
          (finding) =>
            config.findingIds.includes(
              finding.id,
            ),
        );

      const generatedSections =
        buildReportSections({
          config,

          findings:
            selectedFindings,
        });

      setReports(
        (current) =>
          current.map(
            (report) =>
              report.id ===
              reportId
                ? {
                    ...report,

                    status:
                      "DRAFT",

                    sections:
                      generatedSections,
                  }
                : report,
          ),
      );
    }, 1800);
  }

  /* =========================================================
     EDIT
  ========================================================= */

  function handleSaveEdit(
    updatedReport: ReportItem,
  ) {
    setReports(
      (current) =>
        current.map(
          (report) =>
            report.id ===
            updatedReport.id
              ? updatedReport
              : report,
        ),
    );

    setEditOpen(false);

    /*
      Later:

      PATCH /cases/{caseId}/reports/{reportId}
    */
  }

  /* =========================================================
     FINALIZE
  ========================================================= */

  function handleFinalize() {
    if (!selectedReport) {
      return;
    }

    setReports(
      (current) =>
        current.map(
          (report) =>
            report.id ===
            selectedReport.id
              ? {
                  ...report,

                  status:
                    "FINAL",

                  finalizedBy:
                    "Jawad Sabbah",

                  finalizedAt:
                    "Just now",
                }
              : report,
        ),
    );

    setFinalizeOpen(
      false,
    );

    /*
      Later:

      POST
      /cases/{caseId}/reports/{reportId}/finalize
    */
  }

  return (
    <AppShell
      showTopbar={false}
    >
      <div className="flex h-full flex-col overflow-hidden bg-[#F7F7F3]">
        {/* CASE HEADER */}

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

        {/* PAGE HEADER */}

        <div className="shrink-0 px-8 py-5">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-6">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Reports
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Generate,
                review, edit,
                and finalize
                investigation
                reports.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setGenerateOpen(
                  true,
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              <Plus
                size={16}
              />

              Generate Report
            </button>
          </div>
        </div>

        {/* WORKSPACE */}

        <div className="min-h-0 flex-1 px-8 pb-7">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[315px_minmax(0,1fr)_310px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                REPORT LIST
            ============================================= */}

            <aside className="flex min-h-0 flex-col border-r border-[#E6E8E4] bg-[#FAFAF7]">
              {/* SEARCH */}

              <div className="shrink-0 border-b border-[#E6E8E4] p-4">
                <div className="relative">
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
                    placeholder="Search reports..."
                    className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                  />
                </div>
              </div>

              {/* LIST */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredReports.map(
                  (
                    report,
                  ) => {
                    const selected =
                      selectedReportId ===
                      report.id;

                    return (
                      <button
                        key={
                          report.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedReportId(
                            report.id,
                          )
                        }
                        className={`w-full border-b border-[#ECEDE9] px-5 py-5 text-left transition ${
                          selected
                            ? "bg-white"
                            : "hover:bg-[#F4F5F1]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F0EB] text-[#0F4C3A]">
                            {report.status ===
                            "GENERATING" ? (
                              <LoaderCircle
                                size={
                                  16
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <FileText
                                size={
                                  16
                                }
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold leading-5 text-[#29342F]">
                              {
                                report.title
                              }
                            </div>

                            <div className="mt-2">
                              <ReportStatusBadge
                                status={
                                  report.status
                                }
                              />
                            </div>

                            <div className="mt-3 text-[11px] text-[#8D9691]">
                              {
                                report
                                  .findingIds
                                  .length
                              }{" "}
                              findings

                              {report.generatedAt && (
                                <>
                                  <span className="mx-2">
                                    ·
                                  </span>

                                  {
                                    report.generatedAt
                                  }
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </aside>

            {/* =============================================
                REPORT DOCUMENT
            ============================================= */}

            <section className="min-h-0 overflow-y-auto bg-white">
              {selectedReport ? (
                selectedReport.status ===
                "GENERATING" ? (
                  <GeneratingReport />
                ) : (
                  <div className="mx-auto max-w-[820px] px-10 py-8">
                    {/* REPORT HEADER */}

                    <div className="border-b border-[#E8EAE6] pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                            Investigation
                            Report
                          </div>

                          <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.03em] text-[#18201D]">
                            {
                              selectedReport.title
                            }
                          </h1>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#7C8581]">
                            <span>
                              Generated
                              by{" "}
                              {
                                selectedReport.generatedBy
                              }
                            </span>

                            {selectedReport.generatedAt && (
                              <>
                                <span>
                                  ·
                                </span>

                                <span>
                                  {
                                    selectedReport.generatedAt
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <ReportStatusBadge
                          status={
                            selectedReport.status
                          }
                        />
                      </div>
                    </div>

                    {/* REPORT BODY */}

                    <div className="mt-8 space-y-9">
                      {[...selectedReport.sections]
                        .sort(
                          (
                            a,
                            b,
                          ) =>
                            a.order -
                            b.order,
                        )
                        .map(
                          (
                            section,
                          ) => (
                            <ReportSectionBlock
                              key={
                                section.id
                              }
                              section={
                                section
                              }
                              caseId={
                                caseId
                              }
                            />
                          ),
                        )}
                    </div>
                  </div>
                )
              ) : (
                <EmptyReport />
              )}
            </section>

            {/* =============================================
                REPORT DETAILS
            ============================================= */}

            <aside className="min-h-0 border-l border-[#E6E8E4] bg-[#FCFCFA]">
              {selectedReport && (
                <ReportInfoPanel
                  report={
                    selectedReport
                  }
                  onEdit={() =>
                    setEditOpen(
                      true,
                    )
                  }
                  onFinalize={() =>
                    setFinalizeOpen(
                      true,
                    )
                  }
                />
              )}
            </aside>
          </div>
        </div>

        {/* ===============================================
            GENERATE MODAL
        =============================================== */}

        {generateOpen && (
          <GenerateReportModal
            findings={
              verifiedFindings
            }
            onClose={() =>
              setGenerateOpen(
                false,
              )
            }
            onGenerate={
              handleGenerateReport
            }
          />
        )}

        {/* ===============================================
            EDIT MODAL
        =============================================== */}

        {editOpen &&
          selectedReport &&
          selectedReport.status ===
            "DRAFT" && (
            <EditReportModal
              report={
                selectedReport
              }
              onClose={() =>
                setEditOpen(
                  false,
                )
              }
              onSave={
                handleSaveEdit
              }
            />
          )}

        {/* ===============================================
            FINALIZE MODAL
        =============================================== */}

        {finalizeOpen &&
          selectedReport &&
          selectedReport.status ===
            "DRAFT" && (
            <FinalizeReportModal
              report={
                selectedReport
              }
              onClose={() =>
                setFinalizeOpen(
                  false,
                )
              }
              onFinalize={
                handleFinalize
              }
            />
          )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   GENERATING VIEW
========================================================= */

function GeneratingReport() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-[390px] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0EB] text-[#0F4C3A]">
          <LoaderCircle
            size={24}
            className="animate-spin"
          />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-[#26312C]">
          Generating report
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#7A8580]">
          EvidAI is
          assembling the
          selected findings,
          case intelligence,
          and supporting
          citations.
        </p>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#E7EBE7]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#4D8B73]" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY VIEW
========================================================= */

function EmptyReport() {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div>
        <FileText
          size={28}
          className="mx-auto text-[#A3ABA7]"
        />

        <div className="mt-3 text-sm font-semibold text-[#44504A]">
          Select a report
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT SECTION
========================================================= */

function ReportSectionBlock({
  section,
  caseId,
}: {
  section: ReportSection;

  caseId: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8F0EB] text-xs font-semibold text-[#0F4C3A]">
          {
            section.order
          }
        </div>

        <h2 className="text-[18px] font-semibold text-[#26312C]">
          {
            section.title
          }
        </h2>
      </div>

      <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[#5F6C65]">
        {
          section.content
        }
      </div>

      {section.citations
        .length > 0 && (
        <div className="mt-5 space-y-2">
          {section.citations.map(
            (
              citation,
              index,
            ) => (
              <div
                key={
                  citation.id
                }
                className="rounded-lg border border-[#E7E9E5] bg-[#FAFAF7] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F4C3A] text-[9px] font-semibold text-white">
                    {
                      index +
                      1
                    }
                  </span>

                  <span className="text-xs font-medium text-[#4B5751]">
                    {
                      citation.file
                    }
                  </span>

                  <span className="ml-auto text-[10px] text-[#929A96]">
                    Page{" "}
                    {
                      citation.page
                    }
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#78827D]">
                  &ldquo;
                  {
                    citation.quotedText
                  }
                  &rdquo;
                </p>

                <div className="mt-2">
                  <Link
                    href={`/cases/${caseId}/evidence/${citation.evidenceId}?page=${citation.page}`}
                    className="text-xs font-medium text-[#0F4C3A] hover:underline"
                  >
                    Open source →
                  </Link>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   REPORT INFO PANEL
========================================================= */

function ReportInfoPanel({
  report,
  onEdit,
  onFinalize,
}: {
  report: ReportItem;

  onEdit: () => void;

  onFinalize: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}

      <div className="shrink-0 border-b border-[#E7E9E5] bg-white p-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#8A938E]">
          Report Details
        </div>

        <div className="mt-4">
          <ReportStatusBadge
            status={
              report.status
            }
          />
        </div>
      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <InfoBlock
          label="Report Type"
          value={formatLabel(
            report.reportType,
          )}
        />

        <InfoBlock
          label="Generated By"
          value={
            report.generatedBy
          }
        />

        <InfoBlock
          label="Generated At"
          value={
            report.generatedAt ||
            "—"
          }
        />

        {report.finalizedBy && (
          <>
            <InfoBlock
              label="Finalized By"
              value={
                report.finalizedBy
              }
            />

            <InfoBlock
              label="Finalized At"
              value={
                report.finalizedAt ||
                "—"
              }
            />
          </>
        )}

        {/* FINDINGS */}

        <div className="mt-6">
          <SectionLabel label="Included Findings" />

          <div className="mt-3 rounded-lg border border-[#E7E9E5] bg-white p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck
                size={16}
                className="text-[#0F4C3A]"
              />

              <div>
                <div className="text-sm font-semibold text-[#39453F]">
                  {
                    report
                      .findingIds
                      .length
                  }{" "}
                  findings
                </div>

                <div className="mt-1 text-[11px] text-[#929A96]">
                  Linked to this
                  report
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTIONS */}

        <div className="mt-6">
          <SectionLabel label="Sections" />

          <div className="mt-3 space-y-2">
            {report.sections.map(
              (
                section,
              ) => (
                <div
                  key={
                    section.id
                  }
                  className="flex items-center justify-between rounded-lg border border-[#E7E9E5] bg-white px-3 py-3"
                >
                  <span className="text-xs font-medium text-[#4C5953]">
                    {
                      section.title
                    }
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-[#9AA29E]"
                  />
                </div>
              ),
            )}
          </div>
        </div>

        {report.status ===
          "FINAL" && (
          <div className="mt-6 rounded-xl border border-[#DDE9E2] bg-[#F1F7F3] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-[#19704F]"
              />

              <div>
                <div className="text-xs font-semibold text-[#2E5747]">
                  Finalized Report
                </div>

                <p className="mt-1 text-xs leading-5 text-[#718079]">
                  This report has
                  been finalized
                  and should be
                  treated as
                  read-only.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIONS */}

      <div className="shrink-0 border-t border-[#E7E9E5] bg-white p-5">
        {report.status ===
        "DRAFT" ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                onEdit
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
            >
              <Pencil
                size={14}
              />

              Edit Report
            </button>

            <button
              type="button"
              onClick={
                onFinalize
              }
              className="h-10 rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              Finalize
            </button>
          </div>
        ) : report.status ===
          "FINAL" ? (
          <button
            type="button"
            className="h-10 w-full rounded-lg border border-[#DDE1DC] bg-white text-sm font-medium text-[#59645F]"
          >
            Final Report
          </button>
        ) : (
          <button
            disabled
            className="h-10 w-full cursor-not-allowed rounded-lg bg-[#E6E9E5] text-sm text-[#8A938E]"
          >
            Generating…
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EDIT REPORT MODAL
========================================================= */

function EditReportModal({
  report,
  onClose,
  onSave,
}: {
  report: ReportItem;

  onClose: () => void;

  onSave: (
    report: ReportItem,
  ) => void;
}) {
  const [
    title,
    setTitle,
  ] = useState(
    report.title,
  );

  const [
    sections,
    setSections,
  ] = useState<
    ReportSection[]
  >(
    report.sections.map(
      (section) => ({
        ...section,
      }),
    ),
  );

  function updateSection(
    id: string,
    value: string,
  ) {
    setSections(
      (current) =>
        current.map(
          (section) =>
            section.id === id
              ? {
                  ...section,

                  content:
                    value,
                }
              : section,
        ),
    );
  }

  function handleSave() {
    if (!title.trim()) {
      return;
    }

    onSave({
      ...report,

      title:
        title.trim(),

      sections,
    });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="shrink-0 border-b border-[#ECEDE9] px-7 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                Draft Report
              </div>

              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Edit report
              </h2>

              <p className="mt-1 text-sm text-[#74807A]">
                Review and edit
                AI-generated
                content before
                finalization.
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
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          {/* TITLE */}

          <label className="text-sm font-medium text-[#35413B]">
            Report title
          </label>

          <input
            value={title}
            onChange={(
              event,
            ) =>
              setTitle(
                event.target
                  .value,
              )
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] px-4 text-sm outline-none focus:border-[#93AA9F]"
          />

          {/* SECTIONS */}

          <div className="mt-7 space-y-6">
            {sections
              .sort(
                (
                  a,
                  b,
                ) =>
                  a.order -
                  b.order,
              )
              .map(
                (
                  section,
                ) => (
                  <div
                    key={
                      section.id
                    }
                    className="rounded-xl border border-[#E3E6E2] bg-[#FCFCFA] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E8F0EB] text-xs font-semibold text-[#0F4C3A]">
                        {
                          section.order
                        }
                      </div>

                      <div className="text-sm font-semibold text-[#35413B]">
                        {
                          section.title
                        }
                      </div>
                    </div>

                    <textarea
                      value={
                        section.content
                      }
                      onChange={(
                        event,
                      ) =>
                        updateSection(
                          section.id,
                          event
                            .target
                            .value,
                        )
                      }
                      rows={7}
                      className="mt-4 w-full resize-y rounded-lg border border-[#DDE1DC] bg-white px-4 py-3 text-sm leading-6 text-[#45514B] outline-none focus:border-[#93AA9F]"
                    />

                    {section
                      .citations
                      .length >
                      0 && (
                      <div className="mt-4 rounded-lg border border-[#E6E9E5] bg-white p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
                          Existing
                          Citations
                        </div>

                        <div className="mt-2 space-y-2">
                          {section.citations.map(
                            (
                              citation,
                            ) => (
                              <div
                                key={
                                  citation.id
                                }
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="truncate text-[#56625C]">
                                  {
                                    citation.file
                                  }
                                </span>

                                <span className="ml-4 shrink-0 text-[#929A96]">
                                  Page{" "}
                                  {
                                    citation.page
                                  }
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
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
            disabled={
              !title.trim()
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:opacity-40"
          >
            <Check
              size={15}
            />

            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FINALIZE MODAL
========================================================= */

function FinalizeReportModal({
  report,
  onClose,
  onFinalize,
}: {
  report: ReportItem;

  onClose: () => void;

  onFinalize: () => void;
}) {
  const [
    confirmed,
    setConfirmed,
  ] = useState(false);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Finalize Report
            </div>

            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Finalize this
              report?
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
              size={16}
            />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <div className="rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <div>
                <div className="text-sm font-semibold text-[#35413B]">
                  {
                    report.title
                  }
                </div>

                <p className="mt-2 text-xs leading-5 text-[#75817A]">
                  Finalizing marks
                  this report as the
                  reviewed final
                  version. The report
                  will become
                  read-only in this
                  frontend workflow.
                </p>
              </div>
            </div>
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
                  event.target
                    .checked,
                )
              }
              className="mt-0.5 h-4 w-4 accent-[#0F4C3A]"
            />

            <div>
              <div className="text-sm font-medium text-[#35413B]">
                I have
                reviewed this
                report
              </div>

              <p className="mt-1 text-xs leading-5 text-[#87918C]">
                I confirm that
                the report
                content and
                supporting
                citations have
                been reviewed.
              </p>
            </div>
          </label>
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
            disabled={
              !confirmed
            }
            onClick={
              onFinalize
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2
              size={15}
            />

            Finalize Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   GENERATE REPORT MODAL
========================================================= */

function GenerateReportModal({
  findings,
  onClose,
  onGenerate,
}: {
  findings: VerifiedFinding[];

  onClose: () => void;

  onGenerate: (
    config: {
      title: string;

      reportType:
        ReportType;

      findingIds:
        string[];

      includeExecutiveSummary:
        boolean;

      includeScope:
        boolean;

      includeEntities:
        boolean;

      includeTimeline:
        boolean;

      includeFindings:
        boolean;

      includeEvidence:
        boolean;

      includeConclusion:
        boolean;
    },
  ) => void;
}) {
  const [
    title,
    setTitle,
  ] = useState(
    "Investigation Report — Suspicious Payments",
  );

  const [
    reportType,
    setReportType,
  ] =
    useState<ReportType>(
      "FULL",
    );

  const [
    selectedFindingIds,
    setSelectedFindingIds,
  ] = useState<string[]>(
    findings.map(
      (finding) =>
        finding.id,
    ),
  );

  const [
    includeExecutiveSummary,
    setIncludeExecutiveSummary,
  ] = useState(true);

  const [
    includeScope,
    setIncludeScope,
  ] = useState(true);

  const [
    includeEntities,
    setIncludeEntities,
  ] = useState(true);

  const [
    includeTimeline,
    setIncludeTimeline,
  ] = useState(true);

  const [
    includeFindings,
    setIncludeFindings,
  ] = useState(true);

  const [
    includeEvidence,
    setIncludeEvidence,
  ] = useState(true);

  const [
    includeConclusion,
    setIncludeConclusion,
  ] = useState(true);

  function toggleFinding(
    id: string,
  ) {
    setSelectedFindingIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id,
            )
          : [
              ...current,
              id,
            ],
    );
  }

  function handleGenerate() {
    if (!title.trim()) {
      return;
    }

    onGenerate({
      title:
        title.trim(),

      reportType,

      findingIds:
        selectedFindingIds,

      includeExecutiveSummary,

      includeScope,

      includeEntities,

      includeTimeline,

      includeFindings,

      includeEvidence,

      includeConclusion,
    });
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="shrink-0 border-b border-[#ECEDE9] px-7 py-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                EvidAI Report
                Generator
              </div>

              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Generate
                investigation
                report
              </h2>

              <p className="mt-1 text-sm text-[#74807A]">
                Select
                reviewed case
                intelligence for
                the report.
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
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          {/* TITLE */}

          <label className="block text-sm font-medium text-[#35413B]">
            Report title
          </label>

          <input
            value={title}
            onChange={(
              event,
            ) =>
              setTitle(
                event.target
                  .value,
              )
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] px-4 text-sm outline-none focus:border-[#93AA9F]"
          />

          {/* REPORT TYPE */}

          <div className="mt-5">
            <label className="block text-sm font-medium text-[#35413B]">
              Report type
            </label>

            <select
              value={
                reportType
              }
              onChange={(
                event,
              ) =>
                setReportType(
                  event
                    .target
                    .value as ReportType,
                )
              }
              className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm outline-none"
            >
              <option value="FULL">
                Full
                Investigation
                Report
              </option>

              <option value="EXECUTIVE">
                Executive
                Summary
              </option>

              <option value="INTERIM">
                Interim Report
              </option>

              <option value="FINDINGS">
                Findings Report
              </option>
            </select>
          </div>

          {/* FINDINGS */}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#35413B]">
                  Verified
                  findings
                </div>

                <p className="mt-1 text-xs text-[#89928D]">
                  Only reviewed
                  findings should
                  feed the formal
                  report.
                </p>
              </div>

              <span className="text-xs text-[#7A8580]">
                {
                  selectedFindingIds.length
                }{" "}
                selected
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {findings.map(
                (
                  finding,
                ) => {
                  const selected =
                    selectedFindingIds.includes(
                      finding.id,
                    );

                  return (
                    <button
                      key={
                        finding.id
                      }
                      type="button"
                      onClick={() =>
                        toggleFinding(
                          finding.id,
                        )
                      }
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#9DB4A8] bg-[#F3F7F4]"
                          : "border-[#E3E6E2] bg-white hover:bg-[#FAFAF7]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-[#0F4C3A] bg-[#0F4C3A]"
                            : "border-[#C5CBC7]"
                        }`}
                      >
                        {selected && (
                          <Check
                            size={
                              11
                            }
                            className="text-white"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#35413B]">
                          {
                            finding.title
                          }
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#7C8781]">
                          {
                            finding.description
                          }
                        </p>
                      </div>

                      <span className="rounded-full bg-[#F3EEE3] px-2 py-1 text-[9px] font-semibold text-[#98752D]">
                        {
                          finding.severity
                        }
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* SECTIONS */}

          <div className="mt-7">
            <div className="text-sm font-semibold text-[#35413B]">
              Report sections
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ReportSectionOption
                title="Executive Summary"
                checked={
                  includeExecutiveSummary
                }
                onChange={
                  setIncludeExecutiveSummary
                }
              />

              <ReportSectionOption
                title="Investigation Scope"
                checked={
                  includeScope
                }
                onChange={
                  setIncludeScope
                }
              />

              <ReportSectionOption
                title="Key Entities"
                checked={
                  includeEntities
                }
                onChange={
                  setIncludeEntities
                }
              />

              <ReportSectionOption
                title="Timeline"
                checked={
                  includeTimeline
                }
                onChange={
                  setIncludeTimeline
                }
              />

              <ReportSectionOption
                title="Verified Findings"
                checked={
                  includeFindings
                }
                onChange={
                  setIncludeFindings
                }
              />

              <ReportSectionOption
                title="Supporting Evidence"
                checked={
                  includeEvidence
                }
                onChange={
                  setIncludeEvidence
                }
              />

              <ReportSectionOption
                title="Conclusion"
                checked={
                  includeConclusion
                }
                onChange={
                  setIncludeConclusion
                }
              />
            </div>
          </div>

          {/* NOTICE */}

          <div className="mt-6 rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <div>
                <div className="text-xs font-semibold text-[#405048]">
                  Evidence-grounded
                  generation
                </div>

                <p className="mt-1 text-xs leading-5 text-[#75817A]">
                  Generated
                  content remains
                  a draft until an
                  investigator
                  reviews and
                  finalizes it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
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
              handleGenerate
            }
            disabled={
              !title.trim()
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles
              size={15}
            />

            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REPORT SECTION OPTION
========================================================= */

function ReportSectionOption({
  title,
  checked,
  onChange,
}: {
  title: string;

  checked: boolean;

  onChange:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
        checked
          ? "border-[#A6B9AF] bg-[#F3F7F4]"
          : "border-[#E3E6E2] bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .checked,
          )
        }
        className="h-4 w-4 accent-[#0F4C3A]"
      />

      <span className="text-sm font-medium text-[#45514B]">
        {title}
      </span>
    </label>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function ReportStatusBadge({
  status,
}: {
  status: ReportStatus;
}) {
  const styles: Record<
    ReportStatus,
    string
  > = {
    GENERATING:
      "bg-[#E8EDF4] text-[#55708D]",

    DRAFT:
      "bg-[#F3F0E5] text-[#9A762E]",

    FINAL:
      "bg-[#E7F2EC] text-[#19704F]",

    FAILED:
      "bg-[#F7E9E7] text-[#B64D42]",
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
   INFO
========================================================= */

function InfoBlock({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <SectionLabel
        label={label}
      />

      <div className="mt-2 text-sm font-medium text-[#4E5A54]">
        {value}
      </div>
    </div>
  );
}

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
   GENERATE SECTIONS
========================================================= */

function buildReportSections({
  config,
  findings,
}: {
  config: {
    includeExecutiveSummary:
      boolean;

    includeScope:
      boolean;

    includeEntities:
      boolean;

    includeTimeline:
      boolean;

    includeFindings:
      boolean;

    includeEvidence:
      boolean;

    includeConclusion:
      boolean;
  };

  findings:
    VerifiedFinding[];
}) {
  const sections: ReportSection[] =
    [];

  let order = 1;

  if (
    config.includeExecutiveSummary
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Executive Summary",

      sectionType:
        "EXECUTIVE_SUMMARY",

      order:
        order++,

      content:
        `This investigation report summarizes ${findings.length} verified findings identified through review of case evidence. Relevant entities, events, relationships, and supporting records were considered.`,

      citations: [],
    });
  }

  if (
    config.includeScope
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Investigation Scope",

      sectionType:
        "SCOPE",

      order:
        order++,

      content:
        "The investigation reviewed financial records, corporate documentation, communications, extracted entities, relationships, chronological events, claims, and verified findings associated with the case.",

      citations: [],
    });
  }

  if (
    config.includeEntities
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Key Entities",

      sectionType:
        "ENTITIES",

      order:
        order++,

      content:
        "Key entities identified within the investigation include John Smith, ACME Ltd, Global Holdings, associated accounts, and relevant communication identifiers.",

      citations: [],
    });
  }

  if (
    config.includeTimeline
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Timeline of Events",

      sectionType:
        "TIMELINE",

      order:
        order++,

      content:
        "Chronological analysis identified financial transfers, communications, corporate registry changes, and meetings relevant to the investigation.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page: 12,

          quotedText:
            "Transfer of $100,000 from Account 3281 to ACME Ltd.",
        },
      ],
    });
  }

  if (
    config.includeFindings
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Verified Findings",

      sectionType:
        "FINDINGS",

      order:
        order++,

      content:
        findings.length >
        0
          ? findings
              .map(
                (
                  finding,
                  index,
                ) =>
                  `${index + 1}. ${finding.title}\n${finding.description}`,
              )
              .join(
                "\n\n",
              )
          : "No verified findings were selected for this report.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-004",

          file:
            "company_registry.pdf",

          page: 7,

          quotedText:
            "John Smith appears as a listed director of ACME Ltd.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-002",

          file:
            "contract_acme.pdf",

          page: 12,

          quotedText:
            "Agreement references ownership and control rights.",
        },
      ],
    });
  }

  if (
    config.includeEvidence
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Supporting Evidence",

      sectionType:
        "EVIDENCE",

      order:
        order++,

      content:
        "The findings in this report are supported by documentary and transactional evidence retained within the investigation workspace.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page: 12,

          quotedText:
            "Transfer of $100,000 from Account 3281 to ACME Ltd.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-004",

          file:
            "company_registry.pdf",

          page: 7,

          quotedText:
            "John Smith appears as a listed director of ACME Ltd.",
        },
      ],
    });
  }

  if (
    config.includeConclusion
  ) {
    sections.push({
      id:
        createId(),

      title:
        "Conclusion",

      sectionType:
        "CONCLUSION",

      order:
        order++,

      content:
        "The verified findings and supporting evidence should be considered together with the complete investigation record. Any further action should follow investigator review of the underlying evidence.",

      citations: [],
    });
  }

  return sections;
}

/* =========================================================
   HELPERS
========================================================= */

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

function formatLabel(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}