"use client";

import { useMemo, useState } from "react";

import { SummaryCard } from "@/components/ui/summary-card";
import { formatLabel } from "@/lib/formatters";

import {
  FileText,
  Search,
  Upload,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

import {initialEvidence,statusOptions,typeOptions,
  EvidenceItem,EvidenceStatus,EvidenceType
} from "@/data/mocks/evidence";

import {EvidenceRow} from "@/components/evidence/evidence-row";
import {UploadEvidenceModal} from "@/components/evidence/upload-evidence-model";
import {FailedEvidenceModal} from "@/components/evidence/failed-evidence-model";
import {Dropdown} from "@/components/evidence/dropdown";
import {DropdownOption} from "@/components/evidence/dropdown-option";


import { inferEvidenceType } from "@/lib/evidence";

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

