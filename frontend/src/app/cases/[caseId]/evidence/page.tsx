"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  MoreHorizontal,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type EvidenceStatus =
  | "UPLOADED"
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

type EvidenceItem = {
  id: string;

  originalFilename: string;
  displayName?: string;

  fileType: string;
  mimeType?: string;

  fileSize: number;

  processingStatus: EvidenceStatus;

  processingError?: string;

  uploadedBy: string;
  createdAt: string;

  pageCount?: number;
};

/* =========================================================
   MOCK DATA
   Later this comes from the API
========================================================= */

const initialEvidenceData: EvidenceItem[] = [
  {
    id: "ev-001",
    originalFilename: "bank_statement.pdf",
    displayName: "Bank Statement - March",
    fileType: "PDF",
    mimeType: "application/pdf",
    fileSize: 4_820_000,
    processingStatus: "READY",
    uploadedBy: "Jawad Sabbah",
    createdAt: "2h ago",
    pageCount: 42,
  },

  {
    id: "ev-002",
    originalFilename: "offshore_contract.docx",
    displayName: "Offshore Contract",
    fileType: "DOCX",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 1_860_000,
    processingStatus: "READY",
    uploadedBy: "Alex Morgan",
    createdAt: "5h ago",
    pageCount: 12,
  },

  {
    id: "ev-003",
    originalFilename: "transactions.csv",
    displayName: "Transaction Export",
    fileType: "CSV",
    mimeType: "text/csv",
    fileSize: 920_000,
    processingStatus: "PROCESSING",
    uploadedBy: "Jawad Sabbah",
    createdAt: "1d ago",
  },

  {
    id: "ev-004",
    originalFilename: "director_registry.pdf",
    displayName: "Company Registry",
    fileType: "PDF",
    mimeType: "application/pdf",
    fileSize: 2_470_000,
    processingStatus: "READY",
    uploadedBy: "Sarah Reed",
    createdAt: "1d ago",
    pageCount: 28,
  },

  {
    id: "ev-005",
    originalFilename: "emails.zip",
    displayName: "Email Archive",
    fileType: "ZIP",
    mimeType: "application/zip",
    fileSize: 18_600_000,
    processingStatus: "FAILED",

    processingError:
      "The archive could not be processed because no supported evidence files were detected inside the ZIP file.",

    uploadedBy: "Sarah Reed",
    createdAt: "2d ago",
  },

  {
    id: "ev-006",
    originalFilename: "meeting_notes.docx",
    displayName: "Meeting Notes",
    fileType: "DOCX",
    fileSize: 780_000,
    processingStatus: "QUEUED",
    uploadedBy: "Mike Allen",
    createdAt: "2d ago",
  },

  {
    id: "ev-007",
    originalFilename: "authorization_letter.pdf",
    displayName: "Authorization Letter",
    fileType: "PDF",
    fileSize: 620_000,
    processingStatus: "UPLOADED",
    uploadedBy: "Jawad Sabbah",
    createdAt: "Just now",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function EvidencePage() {
  const { caseId } = useParams<{
    caseId: string;
  }>();

  const [evidenceData, setEvidenceData] =
    useState<EvidenceItem[]>(initialEvidenceData);

  const [query, setQuery] = useState("");

  const [status, setStatus] =
    useState<"ALL" | EvidenceStatus>("ALL");

  const [statusOpen, setStatusOpen] =
    useState(false);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [errorEvidence, setErrorEvidence] =
    useState<EvidenceItem | null>(null);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredEvidence = useMemo(() => {
    return evidenceData.filter((item) => {
      const searchValue = query.toLowerCase();

      const matchesSearch =
        item.originalFilename
          .toLowerCase()
          .includes(searchValue) ||
        item.displayName
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === "ALL" ||
        item.processingStatus === status;

      return matchesSearch && matchesStatus;
    });
  }, [evidenceData, query, status]);

  /* =========================================================
     COUNTS
  ========================================================= */

  const readyCount = evidenceData.filter(
    (item) =>
      item.processingStatus === "READY",
  ).length;

  const inProgressCount = evidenceData.filter(
    (item) =>
      item.processingStatus === "UPLOADED" ||
      item.processingStatus === "QUEUED" ||
      item.processingStatus === "PROCESSING",
  ).length;

  const failedCount = evidenceData.filter(
    (item) =>
      item.processingStatus === "FAILED",
  ).length;

  /* =========================================================
     RETRY MOCK
     Later replace this with backend API call
  ========================================================= */

  function retryEvidence(id: string) {
    setEvidenceData((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              processingStatus: "QUEUED",
              processingError: undefined,
            }
          : item,
      ),
    );

    setErrorEvidence(null);

    /*
      Later:

      await evidenceApi.retry(caseId, id);

      Backend should change:
      FAILED -> QUEUED
    */
  }

  /* =========================================================
     MOCK UPLOAD
  ========================================================= */

  function handleUpload(files: File[]) {
    const uploadedItems: EvidenceItem[] =
      files.map((file, index) => ({
        id: `local-${Date.now()}-${index}`,

        originalFilename: file.name,

        displayName: removeFileExtension(
          file.name,
        ),

        fileType:
          getFileExtension(file.name),

        mimeType: file.type,

        fileSize: file.size,

        processingStatus: "UPLOADED",

        uploadedBy: "Jawad Sabbah",

        createdAt: "Just now",
      }));

    setEvidenceData((current) => [
      ...uploadedItems,
      ...current,
    ]);

    setUploadOpen(false);
  }

  return (
    <AppShell showTopbar={false}>
      <div className="h-full overflow-y-auto bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1380px] px-8 py-6">
          {/* =================================================
              CASE HEADER
          ================================================= */}

          <CaseWorkspaceHeader
            caseId={caseId}
            caseNumber="INV-2026-001"
            title="Suspicious Payments Investigation"
            status="OPEN"
          />

          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="mt-7 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Evidence
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Review and manage all evidence connected
                to this investigation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white transition hover:bg-[#0A382B]"
            >
              <Upload size={16} />

              Upload Evidence
            </button>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-6 grid grid-cols-4 gap-4">
            <StatCard
              label="Total Evidence"
              value={evidenceData.length.toString()}
            />

            <StatCard
              label="Ready"
              value={readyCount.toString()}
              type="ready"
            />

            <StatCard
              label="In Progress"
              value={inProgressCount.toString()}
              type="processing"
            />

            <StatCard
              label="Failed"
              value={failedCount.toString()}
              type="failed"
            />
          </div>

          {/* =================================================
              FILTER BAR
          ================================================= */}

          <div className="relative z-[50] mt-6 flex items-center gap-3 overflow-visible">
            {/* SEARCH */}

            <div className="relative w-full max-w-[420px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#919A95]"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search evidence..."
                className="h-10 w-full rounded-lg border border-[#E0E3DE] bg-white pl-10 pr-4 text-sm text-[#18201D] outline-none transition placeholder:text-[#9DA5A1] focus:border-[#98ADA2]"
              />
            </div>

            {/* STATUS */}

            <div className="relative z-[60]">
              <button
                type="button"
                onClick={() =>
                  setStatusOpen(
                    (open) => !open,
                  )
                }
                className="flex h-10 min-w-[160px] items-center justify-between gap-3 rounded-lg border border-[#E0E3DE] bg-white px-4 text-sm text-[#59635F] transition hover:bg-[#F5F6F2]"
              >
                {status === "ALL"
                  ? "All statuses"
                  : formatStatus(status)}

                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    statusOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {statusOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-[999] w-[185px] overflow-hidden rounded-xl border border-[#E2E4DF] bg-white p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
                  {[
                    "ALL",
                    "READY",
                    "PROCESSING",
                    "QUEUED",
                    "UPLOADED",
                    "FAILED",
                  ].map((item) => {
                    const selected =
                      status === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setStatus(
                            item as
                              | "ALL"
                              | EvidenceStatus,
                          );

                          setStatusOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          selected
                            ? "bg-[#EEF3F0] font-medium text-[#0F4C3A]"
                            : "text-[#59635F] hover:bg-[#F3F5F1] hover:text-[#18201D]"
                        }`}
                      >
                        {item === "ALL"
                          ? "All statuses"
                          : formatStatus(
                              item,
                            )}

                        {selected && (
                          <CheckCircle2
                            size={14}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              EVIDENCE TABLE
          ================================================= */}

          <div className="relative z-0 mt-5 overflow-hidden rounded-xl border border-[#E3E5E1] bg-white">
            {/* TABLE HEADER */}

            <div className="grid grid-cols-[minmax(300px,2.3fr)_0.7fr_1fr_0.7fr_1fr_0.8fr_110px] border-b border-[#E7E9E5] bg-[#FAFAF7] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
              <div>Evidence</div>

              <div>Type</div>

              <div>Status</div>

              <div>Pages</div>

              <div>Uploaded by</div>

              <div>Added</div>

              <div>Action</div>
            </div>

            {/* ROWS */}

            {filteredEvidence.length > 0 ? (
              filteredEvidence.map(
                (item) => (
                  <EvidenceRow
                    key={item.id}
                    item={item}
                    caseId={caseId}
                    onRetry={() =>
                      retryEvidence(item.id)
                    }
                    onViewError={() =>
                      setErrorEvidence(item)
                    }
                  />
                ),
              )
            ) : (
              <div className="px-6 py-14 text-center">
                <FileText
                  size={26}
                  className="mx-auto text-[#A4ACA8]"
                />

                <div className="mt-3 text-sm font-medium text-[#44504A]">
                  No evidence found
                </div>

                <p className="mt-1 text-xs text-[#8D9691]">
                  Try changing your search or
                  status filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            UPLOAD MODAL
        =================================================== */}

        {uploadOpen && (
          <UploadEvidenceModal
            onClose={() =>
              setUploadOpen(false)
            }
            onUpload={handleUpload}
          />
        )}

        {/* ===================================================
            ERROR MODAL
        =================================================== */}

        {errorEvidence && (
          <ProcessingErrorModal
            evidence={errorEvidence}
            onClose={() =>
              setErrorEvidence(null)
            }
            onRetry={() =>
              retryEvidence(
                errorEvidence.id,
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
  caseId,
  onRetry,
  onViewError,
}: {
  item: EvidenceItem;
  caseId: string;

  onRetry: () => void;
  onViewError: () => void;
}) {
  const canOpen =
    item.processingStatus === "READY";

  return (
    <div className="grid grid-cols-[minmax(300px,2.3fr)_0.7fr_1fr_0.7fr_1fr_0.8fr_110px] items-center border-b border-[#ECEDE9] bg-white px-5 py-4 last:border-b-0 transition hover:bg-[#FCFCF9]">
      {/* EVIDENCE NAME */}

      {canOpen ? (
        <Link
          href={`/cases/${caseId}/evidence/${item.id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <EvidenceFileContent
            item={item}
          />
        </Link>
      ) : (
        <div className="flex min-w-0 items-center gap-3">
          <EvidenceFileContent
            item={item}
            muted
          />
        </div>
      )}

      {/* TYPE */}

      <div className="text-sm text-[#66716B]">
        {item.fileType}
      </div>

      {/* STATUS */}

      <EvidenceStatusDisplay
        status={item.processingStatus}
      />

      {/* PAGES */}

      <div className="text-sm text-[#66716B]">
        {item.pageCount ?? "—"}
      </div>

      {/* UPLOADED BY */}

      <div className="text-sm text-[#66716B]">
        {item.uploadedBy}
      </div>

      {/* ADDED */}

      <div className="text-sm text-[#818A85]">
        {item.createdAt}
      </div>

      {/* ACTION */}

      <EvidenceAction
        item={item}
        caseId={caseId}
        onRetry={onRetry}
        onViewError={onViewError}
      />
    </div>
  );
}

/* =========================================================
   FILE CONTENT
========================================================= */

function EvidenceFileContent({
  item,
  muted = false,
}: {
  item: EvidenceItem;
  muted?: boolean;
}) {
  return (
    <>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          item.processingStatus ===
          "FAILED"
            ? "bg-[#F8ECEA] text-[#B64D42]"
            : "bg-[#EEF3F0] text-[#0F4C3A]"
        }`}
      >
        <EvidenceIcon
          type={item.fileType}
        />
      </div>

      <div
        className={`min-w-0 ${
          muted ? "opacity-75" : ""
        }`}
      >
        <div
          className={`truncate text-sm font-medium ${
            muted
              ? "text-[#52605A]"
              : "text-[#25302B] hover:text-[#0F4C3A]"
          }`}
        >
          {item.displayName ||
            item.originalFilename}
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#929A96]">
          <span className="truncate">
            {item.originalFilename}
          </span>

          <span>•</span>

          <span>
            {formatFileSize(
              item.fileSize,
            )}
          </span>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   STATUS DISPLAY
========================================================= */

function EvidenceStatusDisplay({
  status,
}: {
  status: EvidenceStatus;
}) {
  if (status === "PROCESSING") {
    return (
      <div className="flex items-center gap-2">
        <LoaderCircle
          size={14}
          className="animate-spin text-[#37688D]"
        />

        <EvidenceStatusBadge
          status={status}
        />
      </div>
    );
  }

  if (
    status === "QUEUED" ||
    status === "UPLOADED"
  ) {
    return (
      <div className="flex items-center gap-2">
        <Clock3
          size={13}
          className="text-[#8A938E]"
        />

        <EvidenceStatusBadge
          status={status}
        />
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle
          size={14}
          className="text-[#B64D42]"
        />

        <EvidenceStatusBadge
          status={status}
        />
      </div>
    );
  }

  return (
    <EvidenceStatusBadge
      status={status}
    />
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function EvidenceStatusBadge({
  status,
}: {
  status: EvidenceStatus;
}) {
  const styles: Record<
    EvidenceStatus,
    string
  > = {
    READY:
      "bg-[#E7F2EC] text-[#19704F]",

    PROCESSING:
      "bg-[#E7EEF6] text-[#37688D]",

    QUEUED:
      "bg-[#F0F1ED] text-[#69726D]",

    FAILED:
      "bg-[#F7E9E7] text-[#B64D42]",

    UPLOADED:
      "bg-[#F4EEDF] text-[#A57A28]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   STATUS ACTION
========================================================= */

function EvidenceAction({
  item,
  caseId,
  onRetry,
  onViewError,
}: {
  item: EvidenceItem;
  caseId: string;
  onRetry: () => void;
  onViewError: () => void;
}) {
  switch (item.processingStatus) {
    /* READY */

    case "READY":
      return (
        <Link
          href={`/cases/${caseId}/evidence/${item.id}`}
          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium text-[#0F4C3A] transition hover:bg-[#EEF3F0]"
        >
          Open
        </Link>
      );

    /* FAILED */

    case "FAILED":
      return (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRetry}
            title="Retry processing"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[#B64D42] transition hover:bg-[#F8ECEA]"
          >
            <RotateCcw size={13} />
            Retry
          </button>

          <button
            type="button"
            onClick={onViewError}
            title="View processing error"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F0F2EE]"
          >
            <MoreHorizontal
              size={16}
            />
          </button>
        </div>
      );

    /* PROCESSING */

    case "PROCESSING":
      return (
        <span className="text-xs text-[#7E8C85]">
          Processing…
        </span>
      );

    /* QUEUED */

    case "QUEUED":
      return (
        <span className="text-xs text-[#8A938E]">
          Waiting
        </span>
      );

    /* UPLOADED */

    case "UPLOADED":
      return (
        <span className="text-xs text-[#9A7A36]">
          Preparing
        </span>
      );

    default:
      return null;
  }
}

/* =========================================================
   FILE ICON
========================================================= */

function EvidenceIcon({
  type,
}: {
  type: string;
}) {
  if (
    ["CSV", "XLSX", "XLS"].includes(type)
  ) {
    return (
      <FileSpreadsheet size={17} />
    );
  }

  if (
    [
      "JPG",
      "JPEG",
      "PNG",
      "WEBP",
    ].includes(type)
  ) {
    return <ImageIcon size={17} />;
  }

  if (
    [
      "PDF",
      "DOCX",
      "DOC",
      "EML",
    ].includes(type)
  ) {
    return <FileText size={17} />;
  }

  return <File size={17} />;
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function StatCard({
  label,
  value,
  type = "normal",
}: {
  label: string;
  value: string;
  type?:
    | "normal"
    | "ready"
    | "processing"
    | "failed";
}) {
  const styles = {
    normal: "text-[#18201D]",

    ready: "text-[#19704F]",

    processing: "text-[#37688D]",

    failed: "text-[#B64D42]",
  };

  return (
    <div className="rounded-xl border border-[#E4E6E2] bg-white px-5 py-4">
      <div
        className={`text-[26px] font-semibold tracking-[-0.03em] ${styles[type]}`}
      >
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-[#7A8580]">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   PROCESSING ERROR MODAL
========================================================= */

function ProcessingErrorModal({
  evidence,
  onClose,
  onRetry,
}: {
  evidence: EvidenceItem;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E9E7] text-[#B64D42]">
              <AlertCircle size={19} />
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B64D42]">
                Processing Failed
              </div>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#18201D]">
                Evidence could not be
                processed
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <div className="rounded-lg border border-[#E5E8E4] bg-[#FAFAF7] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0F4C3A]">
                <EvidenceIcon
                  type={
                    evidence.fileType
                  }
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-[#35413B]">
                  {evidence.displayName ||
                    evidence.originalFilename}
                </div>

                <div className="mt-0.5 text-xs text-[#8A938E]">
                  {
                    evidence.originalFilename
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-[0.09em] text-[#8A938E]">
              Error
            </div>

            <div className="mt-2 rounded-lg border border-[#F0D8D4] bg-[#FCF5F4] p-4">
              <p className="text-sm leading-6 text-[#7E4B44]">
                {evidence.processingError ||
                  "Evidence processing failed. No additional error information is available."}
              </p>
            </div>
          </div>

          <div className="mt-5 text-xs leading-5 text-[#7B8580]">
            Retrying will place this
            evidence back into the
            processing queue.
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white transition hover:bg-[#0A382B]"
          >
            <RotateCcw size={15} />

            Retry Processing
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   UPLOAD MODAL
========================================================= */

function UploadEvidenceModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;

  onUpload: (files: File[]) => void;
}) {
  const [files, setFiles] =
    useState<File[]>([]);

  const [dragging, setDragging] =
    useState(false);

  function addFiles(
    fileList: FileList | null,
  ) {
    if (!fileList) return;

    const incoming =
      Array.from(fileList);

    setFiles((current) => {
      const existingKeys = new Set(
        current.map(
          (file) =>
            `${file.name}-${file.size}`,
        ),
      );

      const unique =
        incoming.filter(
          (file) =>
            !existingKeys.has(
              `${file.name}-${file.size}`,
            ),
        );

      return [...current, ...unique];
    });
  }

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter(
        (_, currentIndex) =>
          currentIndex !== index,
      ),
    );
  }

  function handleUpload() {
    if (files.length === 0) return;

    onUpload(files);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[650px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Evidence Upload
            </div>

            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Upload evidence
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Add documents and files to
              this investigation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <label
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);

              addFiles(
                event.dataTransfer.files,
              );
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-8 py-12 text-center transition ${
              dragging
                ? "border-[#0F4C3A] bg-[#F1F6F3]"
                : "border-[#C9D0CB] bg-[#FAFAF7] hover:border-[#9CB0A5]"
            }`}
          >
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.csv,.xls,.xlsx,.txt,.eml,.jpg,.jpeg,.png,.zip"
              onChange={(event) =>
                addFiles(
                  event.target.files,
                )
              }
            />

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A]">
              <Upload size={21} />
            </div>

            <div className="mt-4 text-sm font-semibold text-[#36413C]">
              Drop evidence files here
            </div>

            <p className="mt-1 text-xs text-[#8A938E]">
              or click to browse from your
              computer
            </p>

            <div className="mt-4 text-[11px] text-[#9AA29E]">
              PDF, DOCX, CSV, XLSX, TXT,
              EML, JPG, PNG, ZIP
            </div>
          </label>

          {/* FILE LIST */}

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#36413C]">
                  Selected files
                </div>

                <div className="text-xs text-[#8A938E]">
                  {files.length}{" "}
                  {files.length === 1
                    ? "file"
                    : "files"}
                </div>
              </div>

              <div className="mt-3 max-h-[230px] space-y-2 overflow-y-auto">
                {files.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center gap-3 rounded-lg border border-[#E5E8E4] bg-white px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
                        <FileText
                          size={16}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[#35413B]">
                          {file.name}
                        </div>

                        <div className="mt-0.5 text-xs text-[#929A96]">
                          {formatUploadSize(
                            file.size,
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(
                            index,
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A938E] transition hover:bg-[#F2F3EF] hover:text-[#B64D42]"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* PIPELINE EXPLANATION */}

          <div className="mt-6 rounded-xl border border-[#E5E8E4] bg-[#F7F8F5] p-4">
            <div className="text-xs font-semibold text-[#415048]">
              After upload
            </div>

            <p className="mt-1 text-xs leading-5 text-[#75817A]">
              EvidAI will first register the
              file, queue it for processing,
              extract its content, and then
              make it available for
              investigation analysis.
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <div className="text-xs text-[#8A938E]">
            {files.length === 0
              ? "No files selected"
              : `${files.length} ready to upload`}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                files.length === 0
              }
              onClick={handleUpload}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white transition hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload size={15} />

              Upload{" "}
              {files.length > 0 &&
                `(${files.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatStatus(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function formatUploadSize(
  bytes: number,
) {
  return formatFileSize(bytes);
}

function getFileExtension(
  filename: string,
) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toUpperCase();

  return extension || "FILE";
}

function removeFileExtension(
  filename: string,
) {
  return filename.replace(
    /\.[^/.]+$/,
    "",
  );
}