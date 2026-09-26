type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

type SeverityBadgeProps = {
  severity: Severity;
};

export function SeverityBadge({
  severity,
}: SeverityBadgeProps) {
  const styles: Record<Severity, string> = {
    CRITICAL:
      "bg-[#FBEAE8] text-[#C5564B]",

    HIGH:
      "bg-[#F8EFE1] text-[#B77527]",

    MEDIUM:
      "bg-[#F5F1E2] text-[#9A7927]",

    LOW:
      "bg-[#EDF1EE] text-[#68756E]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.05em] ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}