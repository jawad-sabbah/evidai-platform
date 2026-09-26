type SectionLabelProps = {
  label: string;
};

export function SectionLabel({
  label,
}: SectionLabelProps) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.11em] text-[#8B9490]">
      {label}
    </div>
  );
}