
export function DashboardMetric({
  label,
  value,
  helper,
  icon,
  tone = "normal",
}: {
  label: string;

  value: string;

  helper: string;

  icon: React.ReactNode;

  tone?:
    | "normal"
    | "success"
    | "warning";
}) {
  const toneStyles = {
    normal:
      "text-[#18201D]",

    success:
      "text-[#19704F]",

    warning:
      "text-[#98752D]",
  };

  return (
    <div className="group rounded-xl border border-[#E3E6E2] bg-white p-5 shadow-[0_2px_10px_rgba(28,40,34,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(28,40,34,0.05)]">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
          {icon}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#94A09A]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#4D8B73]" />

          Live
        </div>
      </div>

      <div
        className={`mt-5 text-[29px] font-semibold tracking-[-0.04em] ${toneStyles[tone]}`}
      >
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-[#46534C]">
        {label}
      </div>

      <div className="mt-1 text-[11px] text-[#929A96]">
        {helper}
      </div>
    </div>
  );
}
