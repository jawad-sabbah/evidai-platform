type InfoItemProps = {
  label: string;
  value: string | number;
  className?: string;
};

export function InfoItem({
  label,
  value,
  className = "",
}: InfoItemProps) {
  return (
    <div className={className}>
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#929A96]">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-[#35413B]">
        {value}
      </div>
    </div>
  );
}