import { EvidenceStatus } from "@/data/mocks/dashboard";
import { formatLabel } from "@/lib/formatters";

export function EvidenceStatusBadge({
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

    FAILED:
      "bg-[#F7E9E7] text-[#B64D42]",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold tracking-[0.04em] ${styles[status]}`}
    >
      {formatLabel(
        status,
      )}
    </span>
  );
}

