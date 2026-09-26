import { AlertTriangle, Clock3, CheckCircle2 } from "lucide-react";


export function AttentionIcon({
  tone,
}: {
  tone:
    | "warning"
    | "danger"
    | "neutral";
}) {
  if (
    tone === "danger"
  ) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7E9E7] text-[#B64D42]">
        <AlertTriangle
          size={14}
        />
      </div>
    );
  }

  if (
    tone === "warning"
  ) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F0E5] text-[#98752D]">
        <Clock3
          size={14}
        />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF1EE] text-[#66716B]">
      <CheckCircle2
        size={14}
      />
    </div>
  );
}
