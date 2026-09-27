import { AlertTriangle, RefreshCw, X } from "lucide-react";

import { EvidenceItem } from "@/data/mocks/evidence";

export function FailedEvidenceModal({
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
