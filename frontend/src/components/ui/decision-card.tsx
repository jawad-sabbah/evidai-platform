type DecisionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

export function DecisionCard({
  title,
  description,
  selected,
  onClick,
}: DecisionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#8FAB9D] bg-[#F1F6F3]"
          : "border-[#E2E5E1] bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
            selected
              ? "border-[#0F4C3A] bg-[#0F4C3A]"
              : "border-[#BBC2BE]"
          }`}
        >
          {selected && (
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </div>

        <div className="text-sm font-semibold text-[#35413B]">
          {title}
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-[#85908A]">
        {description}
      </p>
    </button>
  );
}