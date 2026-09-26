import { Check } from "lucide-react";

export function DropdownOption({
  label,
  secondary,
  selected,
  onClick,
}: {
  label:
    string;

  secondary?:
    string;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex w-full items-center justify-between gap-5 rounded-lg px-3 py-2.5 text-left transition ${
        selected
          ? "bg-[#EEF3F0]"
          : "hover:bg-[#F5F6F2]"
      }`}
    >
      <div className="min-w-0">
        <div
          className={`text-sm ${
            selected
              ? "font-medium text-[#0F4C3A]"
              : "text-[#59645F]"
          }`}
        >
          {
            label
          }
        </div>

        {secondary && (
          <div className="mt-0.5 max-w-[260px] truncate text-[10px] text-[#949C98]">
            {
              secondary
            }
          </div>
        )}
      </div>

      {selected && (
        <Check
          size={13}
          className="shrink-0 text-[#0F4C3A]"
        />
      )}
    </button>
  );
}
