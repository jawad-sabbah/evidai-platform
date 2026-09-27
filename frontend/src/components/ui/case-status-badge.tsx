import {CaseStatus} from "@/data/mocks/dashboard";
import {formatLabel} from "@/lib/formatters";

export function CaseStatusBadge({
  status,
}: {
  status:
    CaseStatus;
}) {
  const styles: Record<
    CaseStatus,
    string
  > = {
    OPEN:
      "bg-[#E7F2EC] text-[#19704F]",

    IN_REVIEW:
      "bg-[#F3F0E5] text-[#98752D]",

    CLOSED:
      "bg-[#EDF0EE] text-[#66716B]",

    ARCHIVED:
      "bg-[#ECECEF] text-[#777786]",
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


