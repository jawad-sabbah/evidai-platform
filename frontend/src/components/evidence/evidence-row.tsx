import Link from "next/link";
import {RefreshCw,LoaderCircle} from "lucide-react";

import {EvidenceItem} from "@/data/mocks/evidence";

import {EvidenceIcon} from "@/components/evidence/evidence-icon";

import {EvidenceStatusBadge} from "@/components/ui/evidence-status-badge";

import {formatLabel} from "@/lib/formatters";

export function EvidenceRow({
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
