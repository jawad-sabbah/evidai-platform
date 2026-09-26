"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SummaryCard } from "@/components/ui/summary-card";
import { formatLabel } from "@/lib/formatters";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

/* =========================================================
   TYPES
========================================================= */

type EvidenceStatus =
  | "UPLOADED"
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

type EvidenceType =
  | "PDF"
  | "DOCUMENT"
  | "SPREADSHEET"
  | "IMAGE"
  | "ARCHIVE"
  | "OTHER";

type EvidenceItem = {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;

  name: string;
  type: EvidenceType;
  status: EvidenceStatus;

  size: string;
  pages?: number;

  uploadedBy: string;
  uploadedAt: string;

  progress?: number;
  processingError?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

const initialEvidence: EvidenceItem[] = [
  {
    id: "ev-001",

    caseId: "1",

    caseNumber: "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "bank_statement.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "4.8 MB",

    pages:
      32,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 10:14",
  },

  {
    id:
      "ev-002",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "contract_acme.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "2.1 MB",

    pages:
      18,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 09:52",
  },

  {
    id:
      "ev-003",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "transactions.csv",

    type:
      "SPREADSHEET",

    status:
      "READY",

    size:
      "684 KB",

    uploadedBy:
      "Sarah Reed",

    uploadedAt:
      "Sep 23, 2026 · 16:40",
  },

  {
    id:
      "ev-004",

    caseId:
      "2",

    caseNumber:
      "INV-2026-002",

    caseTitle:
      "Offshore Transfers Review",

    name:
      "company_registry.pdf",

    type:
      "PDF",

    status:
      "QUEUED",

    size:
      "1.7 MB",

    pages:
      11,

    uploadedBy:
      "Sarah Reed",

    uploadedAt:
      "Sep 24, 2026 · 11:07",
  },

  {
    id:
      "ev-005",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "email_archive.zip",

    type:
      "ARCHIVE",

    status:
      "PROCESSING",

    size:
      "18.2 MB",

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 12:01",

    progress:
      68,
  },

  {
    id:
      "ev-006",

    caseId:
      "3",

    caseNumber:
      "INV-2026-003",

    caseTitle:
      "Procurement Fraud Investigation",

    name:
      "supplier_records.xlsx",

    type:
      "SPREADSHEET",

    status:
      "FAILED",

    size:
      "3.4 MB",

    uploadedBy:
      "Alex Morgan",

    uploadedAt:
      "Sep 24, 2026 · 08:35",

    processingError:
      "The spreadsheet could not be parsed because the workbook contains a corrupted worksheet.",
  },

  {
    id:
      "ev-007",

    caseId:
      "3",

    caseNumber:
      "INV-2026-003",

    caseTitle:
      "Procurement Fraud Investigation",

    name:
      "invoice_scan.jpg",

    type:
      "IMAGE",

    status:
      "UPLOADED",

    size:
      "2.9 MB",

    uploadedBy:
      "Alex Morgan",

    uploadedAt:
      "Sep 24, 2026 · 12:28",
  },

  {
    id:
      "ev-008",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "interview_notes.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "1.3 MB",

    pages:
      9,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 22, 2026 · 14:10",
  },
];

/* =========================================================
   OPTIONS
========================================================= */

const statusOptions: Array<
  "ALL" | EvidenceStatus
> = [
  "ALL",
  "READY",
  "PROCESSING",
  "QUEUED",
  "UPLOADED",
  "FAILED",
];

const typeOptions: Array<
  "ALL" | EvidenceType
> = [
  "ALL",
  "PDF",
  "DOCUMENT",
  "SPREADSHEET",
  "IMAGE",
  "ARCHIVE",
  "OTHER",
];

/* =========================================================
   PAGE
========================================================= */

export default function EvidencePage() {
  const [
    evidence,
    setEvidence,
  ] =
    useState<EvidenceItem[]>(
      initialEvidence,
    );

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "ALL" | EvidenceStatus
    >("ALL");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<
      "ALL" | EvidenceType
    >("ALL");

  const [
    caseFilter,
    setCaseFilter,
  ] =
    useState<string>(
      "ALL",
    );

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const [
    typeOpen,
    setTypeOpen,
  ] =
    useState(false);

  const [
    caseOpen,
    setCaseOpen,
  ] =
    useState(false);

  const [
    uploadOpen,
    setUploadOpen,
  ] =
    useState(false);

  const [
    failedEvidence,
    setFailedEvidence,
  ] =
    useState<EvidenceItem | null>(
      null,
    );

  /* =========================================================
     CASE OPTIONS
  ========================================================= */

  const caseOptions =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            id: string;
            number: string;
            title: string;
          }
        >();

      evidence.forEach(
        (item) => {
          map.set(
            item.caseId,
            {
              id:
                item.caseId,

              number:
                item.caseNumber,

              title:
                item.caseTitle,
            },
          );
        },
      );

      return [
        ...map.values(),
      ];
    }, [evidence]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredEvidence =
    useMemo(() => {
      const value =
        query
          .toLowerCase()
          .trim();

      return evidence.filter(
        (item) => {
          const matchesSearch =
            item.name
              .toLowerCase()
              .includes(
                value,
              ) ||
            item.caseNumber
              .toLowerCase()
              .includes(
                value,
              ) ||
            item.caseTitle
              .toLowerCase()
              .includes(
                value,
              );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            item.status ===
              statusFilter;

          const matchesType =
            typeFilter ===
              "ALL" ||
            item.type ===
              typeFilter;

          const matchesCase =
            caseFilter ===
              "ALL" ||
            item.caseId ===
              caseFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesCase
          );
        },
      );
    }, [
      evidence,
      query,
      statusFilter,
      typeFilter,
      caseFilter,
    ]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const readyCount =
    evidence.filter(
      (item) =>
        item.status ===
        "READY",
    ).length;

  const processingCount =
    evidence.filter(
      (item) =>
        item.status ===
          "PROCESSING" ||
        item.status ===
          "QUEUED" ||
        item.status ===
          "UPLOADED",
    ).length;

  const failedCount =
    evidence.filter(
      (item) =>
        item.status ===
        "FAILED",
    ).length;

  /* =========================================================
     RETRY
  ========================================================= */

  function retryEvidence(
    evidenceId: string,
  ) {
    setEvidence(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            evidenceId
              ? {
                  ...item,

                  status:
                    "QUEUED",

                  progress:
                    0,

                  processingError:
                    undefined,
                }
              : item,
        ),
    );

    setFailedEvidence(
      null,
    );
  }

  /* =========================================================
     MOCK UPLOAD
  ========================================================= */

  function addMockEvidence(
    data: {
      caseId: string;
      name: string;
    },
  ) {
    const selectedCase =
      caseOptions.find(
        (item) =>
          item.id ===
          data.caseId,
      );

    if (!selectedCase) {
      return;
    }

    const newItem: EvidenceItem =
      {
        id:
          `ev-${Date.now()}`,

        caseId:
          selectedCase.id,

        caseNumber:
          selectedCase.number,

        caseTitle:
          selectedCase.title,

        name:
          data.name,

        type:
          inferEvidenceType(
            data.name,
          ),

        status:
          "UPLOADED",

        size:
          "1.2 MB",

        uploadedBy:
          "Jawad Sabbah",

        uploadedAt:
          "Just now",
      };

    setEvidence(
      (current) => [
        newItem,
        ...current,
      ],
    );

    setUploadOpen(false);
  }

  return (
    <AppShell
      showTopbar={false}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F7F3]">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="shrink-0 px-8 pt-7">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                Investigation Workspace
              </div>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
                Evidence
              </h1>

              <p className="mt-1 text-sm text-[#7A8580]">
                Review and manage
                evidence across all
                investigations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setUploadOpen(
                  true,
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              <Upload
                size={15}
              />

              Upload Evidence
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="shrink-0 px-8 pt-6">
          <div className="mx-auto grid max-w-[1380px] grid-cols-4 gap-4">
            <SummaryCard
              label="Total Evidence"
              value={
                evidence.length
              }
              helper="Across all cases"
            />

            <SummaryCard
              label="Ready"
              value={
                readyCount
              }
              helper="Available for investigation"
              tone="success"
            />

            <SummaryCard
              label="In Progress"
              value={
                processingCount
              }
              helper="Uploaded, queued or processing"
              tone="processing"
            />

            <SummaryCard
              label="Failed"
              value={
                failedCount
              }
              helper="Requires attention"
              tone="danger"
            />
          </div>
        </div>

        {/* =================================================
            EVIDENCE WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 pb-7 pt-5">
          <div className="mx-auto flex h-full min-h-0 max-w-[1380px] flex-col overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                FILTER BAR
            ============================================= */}

            <div className="relative z-[50] flex shrink-0 items-center gap-3 overflow-visible border-b border-[#E7E9E5] bg-[#FAFAF7] px-6 py-4">
              {/* SEARCH */}

              <div className="relative min-w-[300px] flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929B96]"
                />

                <input
                  value={query}
                  onChange={(
                    event,
                  ) =>
                    setQuery(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search evidence, cases or case numbers..."
                  className="h-10 w-full rounded-lg border border-[#DFE3DE] bg-white pl-9 pr-4 text-sm text-[#26312C] outline-none placeholder:text-[#A2AAA6] focus:border-[#93A99E]"
                />
              </div>

              {/* CASE FILTER */}

              <Dropdown
                label={
                  caseFilter ===
                  "ALL"
                    ? "All cases"
                    : caseOptions.find(
                        (
                          item,
                        ) =>
                          item.id ===
                          caseFilter,
                      )
                        ?.number ??
                      "Case"
                }
                open={
                  caseOpen
                }
                setOpen={
                  setCaseOpen
                }
              >
                <DropdownOption
                  selected={
                    caseFilter ===
                    "ALL"
                  }
                  label="All cases"
                  onClick={() => {
                    setCaseFilter(
                      "ALL",
                    );

                    setCaseOpen(
                      false,
                    );
                  }}
                />

                {caseOptions.map(
                  (
                    item,
                  ) => (
                    <DropdownOption
                      key={
                        item.id
                      }
                      selected={
                        caseFilter ===
                        item.id
                      }
                      label={
                        item.number
                      }
                      secondary={
                        item.title
                      }
                      onClick={() => {
                        setCaseFilter(
                          item.id,
                        );

                        setCaseOpen(
                          false,
                        );
                      }}
                    />
                  ),
                )}
              </Dropdown>

              {/* TYPE FILTER */}

              <Dropdown
                label={
                  typeFilter ===
                  "ALL"
                    ? "All types"  
                    : formatLabel(
                        typeFilter,
                      )
                }
                open={
                  typeOpen
                }
                setOpen={
                  setTypeOpen
                }
              >
                {typeOptions.map(
                  (
                    type,
                  ) => (
                    <DropdownOption
                      key={
                        type
                      }
                      selected={
                        typeFilter ===
                        type
                      }
                      label={
                        type ===
                        "ALL"
                          ? "All types"
                          : formatLabel(
                              type,
                            )
                      }
                      onClick={() => {
                        setTypeFilter(
                          type,
                        );

                        setTypeOpen(
                          false,
                        );
                      }}
                    />
                  ),
                )}
              </Dropdown>

              {/* STATUS FILTER */}

              <Dropdown
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
              >
                {statusOptions.map(
                  (
                    status,
                  ) => (
                    <DropdownOption
                      key={
                        status
                      }
                      selected={
                        statusFilter ===
                        status
                      }
                      label={
                        status ===
                        "ALL"
                          ? "All statuses"
                          : formatLabel(
                              status,
                            )
                      }
                      onClick={() => {
                        setStatusFilter(
                          status,
                        );

                        setStatusOpen(
                          false,
                        );
                      }}
                    />
                  ),
                )}
              </Dropdown>
            </div>

            {/* =============================================
                TABLE HEADER
            ============================================= */}

            <div className="grid shrink-0 grid-cols-[minmax(260px,1.6fr)_minmax(220px,1.2fr)_110px_110px_100px_150px] items-center border-b border-[#E7E9E5] bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
              <div>
                Evidence
              </div>

              <div>
                Case
              </div>

              <div>
                Type
              </div>

              <div>
                Status
              </div>

              <div>
                Size
              </div>

              <div className="text-right">
                Action
              </div>
            </div>

            {/* =============================================
                EVIDENCE LIST
            ============================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filteredEvidence.length >
              0 ? (
                filteredEvidence.map(
                  (
                    item,
                  ) => (
                    <EvidenceRow
                      key={
                        item.id
                      }
                      item={
                        item
                      }
                      onRetry={() =>
                        retryEvidence(
                          item.id,
                        )
                      }
                      onViewError={() =>
                        setFailedEvidence(
                          item,
                        )
                      }
                    />
                  ),
                )
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center text-center">
                  <div>
                    <FileText
                      size={
                        30
                      }
                      className="mx-auto text-[#A3ABA7]"
                    />

                    <div className="mt-3 text-sm font-semibold text-[#44504A]">
                      No evidence
                      found
                    </div>

                    <p className="mt-1 text-xs text-[#8D9691]">
                      Try changing
                      your search or
                      filters.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* =============================================
                FOOTER
            ============================================= */}

            <div className="flex shrink-0 items-center justify-between border-t border-[#E7E9E5] bg-[#FCFCFA] px-6 py-3">
              <div className="text-[11px] text-[#8A938E]">
                Showing{" "}
                {
                  filteredEvidence.length
                }{" "}
                of{" "}
                {
                  evidence.length
                }{" "}
                evidence items
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#9AA29E]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#4D8B73]" />

                Evidence workspace
                active
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            UPLOAD MODAL
        ================================================= */}

        {uploadOpen && (
          <UploadEvidenceModal
            cases={
              caseOptions
            }
            onClose={() =>
              setUploadOpen(
                false,
              )
            }
            onUpload={
              addMockEvidence
            }
          />
        )}

        {/* =================================================
            FAILED MODAL
        ================================================= */}

        {failedEvidence && (
          <FailedEvidenceModal
            item={
              failedEvidence
            }
            onClose={() =>
              setFailedEvidence(
                null,
              )
            }
            onRetry={() =>
              retryEvidence(
                failedEvidence.id,
              )
            }
          />
        )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   EVIDENCE ROW
========================================================= */

function EvidenceRow({
  item,
  onRetry,
  onViewError,
}: {
  item:
    EvidenceItem;

  onRetry:
    () => void;

  onViewError:
    () => void;
}) {
  const ready =
    item.status ===
    "READY";

  return (
    <div className="grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1.2fr)_110px_110px_100px_150px] items-center border-b border-[#ECEDE9] px-6 py-4 transition last:border-b-0 hover:bg-[#FAFAF7]">
      {/* EVIDENCE */}

      <div className="flex min-w-0 items-center gap-3 pr-4">
        <EvidenceIcon
          type={
            item.type
          }
        />

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#35413B]">
            {
              item.name
            }
          </div>

          <div className="mt-1 flex items-center gap-2 text-[10px] text-[#919995]">
            <span>
              {
                item.uploadedBy
              }
            </span>

            <span>
              •
            </span>

            <span>
              {
                item.uploadedAt
              }
            </span>

            {item.pages && (
              <>
                <span>
                  •
                </span>

                <span>
                  {
                    item.pages
                  }{" "}
                  pages
                </span>
              </>
            )}
          </div>

          {item.status ===
            "PROCESSING" && (
            <div className="mt-2 max-w-[240px]">
              <div className="h-1 overflow-hidden rounded-full bg-[#E6EAE6]">
                <div
                  className="h-full rounded-full bg-[#4D8B73]"
                  style={{
                    width: `${
                      item.progress ??
                      0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CASE */}

      <Link
        href={`/cases/${item.caseId}`}
        className="min-w-0 pr-4"
      >
        <div className="text-xs font-semibold text-[#0F4C3A] hover:underline">
          {
            item.caseNumber
          }
        </div>

        <div className="mt-1 truncate text-[10px] text-[#8D9691]">
          {
            item.caseTitle
          }
        </div>
      </Link>

      {/* TYPE */}

      <div className="text-xs text-[#66716B]">
        {formatLabel(
          item.type,
        )}
      </div>

      {/* STATUS */}

      <EvidenceStatusBadge
        status={
          item.status
        }
      />

      {/* SIZE */}

      <div className="text-xs text-[#7C8781]">
        {
          item.size
        }
      </div>

      {/* ACTION */}

      <div className="flex justify-end">
        {ready ? (
          <Link
            href={`/cases/${item.caseId}/evidence/${item.id}`}
            className="inline-flex h-8 min-w-[100px] items-center justify-center rounded-lg border border-[#D7E0DA] bg-white px-3 text-xs font-medium text-[#0F4C3A] transition hover:bg-[#F1F6F3]"
          >
            Open Evidence
          </Link>
        ) : item.status ===
          "FAILED" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                onViewError
              }
              className="h-8 rounded-lg border border-[#E2D5D2] bg-white px-3 text-xs font-medium text-[#A65349] hover:bg-[#F9F0EE]"
            >
              View Error
            </button>

            <button
              type="button"
              onClick={
                onRetry
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F4C3A] text-white hover:bg-[#0A382B]"
            >
              <RefreshCw
                size={13}
              />
            </button>
          </div>
        ) : (
          <div className="inline-flex h-8 min-w-[100px] items-center justify-center gap-2 rounded-lg bg-[#F1F2EF] px-3 text-xs font-medium text-[#7D8782]">
            {item.status ===
              "PROCESSING" && (
              <LoaderCircle
                size={12}
                className="animate-spin"
              />
            )}

            {item.status ===
            "PROCESSING"
              ? "Processing"
              : item.status ===
                "QUEUED"
              ? "Waiting"
              : "Preparing"}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EVIDENCE ICON
========================================================= */

function EvidenceIcon({
  type,
}: {
  type:
    EvidenceType;
}) {
  const className =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F0] text-[#0F4C3A]";

  if (
    type ===
    "SPREADSHEET"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <FileSpreadsheet
          size={17}
        />
      </div>
    );
  }

  if (
    type ===
    "IMAGE"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <ImageIcon
          size={17}
        />
      </div>
    );
  }

  if (
    type ===
    "ARCHIVE"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <FileArchive
          size={17}
        />
      </div>
    );
  }

  return (
    <div
      className={
        className
      }
    >
      <FileText
        size={17}
      />
    </div>
  );
}

/* =========================================================
   STATUS BADGE
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

    UPLOADED:
      "bg-[#EEF1EE] text-[#66716B]",

    FAILED:
      "bg-[#F7E9E7] text-[#B64D42]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[status]}`}
    >
      {formatLabel(
        status,
      )}
    </span>
  );
}

/* =========================================================
   DROPDOWN
========================================================= */

function Dropdown({
  label,
  open,
  setOpen,
  children,
}: {
  label:
    string;

  open:
    boolean;

  setOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;

  children:
    React.ReactNode;
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
        className="flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-lg border border-[#DFE3DE] bg-white px-4 text-sm text-[#59645F]"
      >
        <span className="truncate">
          {
            label
          }
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[999] max-h-[320px] min-w-[210px] overflow-y-auto rounded-xl border border-[#E1E4DF] bg-white p-1.5 shadow-[0_14px_35px_rgba(25,35,30,0.14)]">
          {
            children
          }
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DROPDOWN OPTION
========================================================= */

function DropdownOption({
  label,
  secondary,
  selected,
  onClick,
}: {
  label:
    string;

  secondary?:
    string;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-left transition ${
        selected
          ? "bg-[#EEF3F0]"
          : "hover:bg-[#F5F6F2]"
      }`}
    >
      <div className="min-w-0">
        <div
          className={`text-sm ${
            selected
              ? "font-medium text-[#0F4C3A]"
              : "text-[#59645F]"
          }`}
        >
          {
            label
          }
        </div>

        {secondary && (
          <div className="mt-0.5 max-w-[260px] truncate text-[10px] text-[#949C98]">
            {
              secondary
            }
          </div>
        )}
      </div>

      {selected && (
        <Check
          size={13}
          className="shrink-0 text-[#0F4C3A]"
        />
      )}
    </button>
  );
}

/* =========================================================
   UPLOAD MODAL
========================================================= */

function UploadEvidenceModal({
  cases,
  onClose,
  onUpload,
}: {
  cases: {
    id: string;
    number: string;
    title: string;
  }[];

  onClose:
    () => void;

  onUpload:
    (data: {
      caseId: string;
      name: string;
    }) => void;
}) {
  const [
    caseId,
    setCaseId,
  ] =
    useState(
      cases[0]?.id ??
        "",
    );

  const [
    fileName,
    setFileName,
  ] =
    useState(
      "new_evidence.pdf",
    );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[590px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Evidence Upload
            </div>

            <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Upload evidence
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Add a new evidence
              item to an active
              investigation.
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
          {/* CASE */}

          <label className="text-sm font-medium text-[#35413B]">
            Case
          </label>

          <select
            value={
              caseId
            }
            onChange={(
              event,
            ) =>
              setCaseId(
                event.target
                  .value,
              )
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm outline-none"
          >
            {cases.map(
              (
                item,
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {
                    item.number
                  }{" "}
                  —{" "}
                  {
                    item.title
                  }
                </option>
              ),
            )}
          </select>

          {/* MOCK FILE */}

          <div className="mt-6">
            <label className="text-sm font-medium text-[#35413B]">
              Evidence file
            </label>

            <div className="mt-2 rounded-xl border-2 border-dashed border-[#D7DDD8] bg-[#FAFAF7] p-7 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#0F4C3A]">
                <Upload
                  size={18}
                />
              </div>

              <div className="mt-3 text-sm font-medium text-[#45514B]">
                Upload evidence
              </div>

              <p className="mt-1 text-xs text-[#89928D]">
                Frontend mock for
                now. Real file
                upload will be
                connected to the
                backend.
              </p>

              <input
                value={
                  fileName
                }
                onChange={(
                  event,
                ) =>
                  setFileName(
                    event.target
                      .value,
                  )
                }
                className="mt-4 h-10 w-full rounded-lg border border-[#DDE1DC] bg-white px-3 text-sm outline-none"
              />
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
              !caseId ||
              !fileName.trim()
            }
            onClick={() =>
              onUpload({
                caseId,

                name:
                  fileName.trim(),
              })
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload
              size={14}
            />

            Upload Evidence
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FAILED MODAL
========================================================= */

function FailedEvidenceModal({
  item,
  onClose,
  onRetry,
}: {
  item:
    EvidenceItem;

  onClose:
    () => void;

  onRetry:
    () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[540px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B64D42]">
              Processing Failed
            </div>

            <h2 className="mt-2 text-[22px] font-semibold text-[#18201D]">
              Evidence could not
              be processed
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
          <div className="flex items-center gap-3 rounded-xl border border-[#E7E9E5] bg-[#FAFAF7] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F7E9E7] text-[#B64D42]">
              <AlertTriangle
                size={17}
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-[#35413B]">
                {
                  item.name
                }
              </div>

              <div className="mt-1 text-xs text-[#8A938E]">
                {
                  item.caseNumber
                }
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
              Error
            </div>

            <div className="mt-2 rounded-lg border border-[#F0D9D5] bg-[#FCF4F2] p-4 text-xs leading-5 text-[#8E514A]">
              {item.processingError ??
                "Evidence processing failed unexpectedly."}
            </div>
          </div>

          <p className="mt-5 text-xs leading-5 text-[#7A8580]">
            Retrying will place
            this evidence back
            into the processing
            queue. The original
            evidence record will
            not be deleted.
          </p>
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
            Close
          </button>

          <button
            type="button"
            onClick={
              onRetry
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B]"
          >
            <RefreshCw
              size={14}
            />

            Retry Processing
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function inferEvidenceType(
  fileName: string,
): EvidenceType {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "pdf"
  ) {
    return "PDF";
  }

  if (
    [
      "doc",
      "docx",
      "txt",
      "eml",
    ].includes(
      extension ?? "",
    )
  ) {
    return "DOCUMENT";
  }

  if (
    [
      "csv",
      "xls",
      "xlsx",
    ].includes(
      extension ?? "",
    )
  ) {
    return "SPREADSHEET";
  }

  if (
    [
      "jpg",
      "jpeg",
      "png",
    ].includes(
      extension ?? "",
    )
  ) {
    return "IMAGE";
  }

  if (
    extension ===
    "zip"
  ) {
    return "ARCHIVE";
  }

  return "OTHER";
}

