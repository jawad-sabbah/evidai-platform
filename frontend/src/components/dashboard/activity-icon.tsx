import { FileText, Users, ShieldCheck, MessageSquare, CheckCircle2 } from "lucide-react";
import { ActivityItem } from "@/data/mocks/dashboard";

export function ActivityIcon({
  type,
}: {
  type:
    ActivityItem["type"];
}) {
  const wrapper =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg";

  switch (type) {
    case "EVIDENCE":
      return (
        <div
          className={`${wrapper} bg-[#E8EDF5] text-[#55708D]`}
        >
          <FileText
            size={14}
          />
        </div>
      );

    case "ENTITY":
      return (
        <div
          className={`${wrapper} bg-[#E8F0EB] text-[#0F4C3A]`}
        >
          <Users
            size={14}
          />
        </div>
      );

    case "FINDING":
      return (
        <div
          className={`${wrapper} bg-[#E7F2EC] text-[#19704F]`}
        >
          <ShieldCheck
            size={14}
          />
        </div>
      );

    case "REPORT":
      return (
        <div
          className={`${wrapper} bg-[#EFEAF2] text-[#75617E]`}
        >
          <FileText
            size={14}
          />
        </div>
      );

    case "CLAIM":
      return (
        <div
          className={`${wrapper} bg-[#F3F0E5] text-[#98752D]`}
        >
          <MessageSquare
            size={14}
          />
        </div>
      );

    default:
      return (
        <div
          className={`${wrapper} bg-[#EEF1EE] text-[#66716B]`}
        >
          <CheckCircle2
            size={14}
          />
        </div>
      );
  }
}


