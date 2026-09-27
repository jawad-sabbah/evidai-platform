import {FileText, AlertTriangle} from "lucide-react";
import {EvidenceStatusBadge} from "@/components/ui/evidence-status-badge";
import {EvidencePipelineItem} from "@/data/mocks/dashboard";

export function EvidencePipelineCard({
  item,
}: {
  item:
    EvidencePipelineItem;
}) {
  return (
    <div className="rounded-xl border border-[#E5E8E4] bg-[#FAFAF7] p-4 transition hover:bg-[#F7F8F5]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F4C3A] shadow-sm">
          <FileText
            size={15}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-[#3E4A44]">
            {
              item.file
            }
          </div>

          <div className="mt-1 text-[10px] text-[#919995]">
            {
              item.caseNumber
            }
          </div>
        </div>

        <EvidenceStatusBadge
          status={
            item.status
          }
        />
      </div>

      {item.status ===
        "PROCESSING" && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] text-[#929A96]">
              Processing
            </span>

            <span className="text-[10px] font-semibold text-[#0F4C3A]">
              {
                item.progress
              }
              %
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E9E5]">
            <div
              className="h-full rounded-full bg-[#4D8B73]"
              style={{
                width: `${item.progress ?? 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {item.status ===
        "FAILED" && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[#B64D42]">
          <AlertTriangle
            size={11}
          />

          Processing requires
          attention
        </div>
      )}
    </div>
  );
}
