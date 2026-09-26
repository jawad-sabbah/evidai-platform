type SummaryCardTone =
  | "normal"
  | "success"
  | "warning"
  | "danger"
  | "processing"
  | "neutral";

type SummaryCardProps = {
  label: string;

  value: string | number;

  helper?: string;

  tone?: SummaryCardTone;

  className?: string;
};

export function SummaryCard({
  label,
  value,
  helper,
  tone = "normal",
  className = "",
}: SummaryCardProps) {
  const styles: Record<SummaryCardTone, string> = {
    normal:
      "text-[#18201D]",

    success:
      "text-[#19704F]",

    warning:
      "text-[#98752D]",

    danger:
      "text-[#B64D42]",

    processing:
      "text-[#55708D]",

    neutral:
      "text-[#66716B]",
  };

  return (
    <div
      className={`rounded-xl border border-[#E4E6E2] bg-white px-5 py-4 ${className}`}
    >
      <div
        className={`text-[26px] font-semibold tracking-[-0.03em] ${styles[tone]}`}
      >
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-[#7A8580]">
        {label}
      </div>

      {helper && (
        <div className="mt-1 text-[11px] text-[#929A96]">
          {helper}
        </div>
      )}
    </div>
  );
}