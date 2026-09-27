import { ChevronDown } from "lucide-react";


export function Dropdown({
  label,
  open,
  setOpen,
  children,
}: {
  label:
    string;

  open:
    boolean;

  setOpen:
    React.Dispatch<
      React.SetStateAction<boolean>
    >;

  children:
    React.ReactNode;
}) {
  return (
    <div className="relative z-[60]">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (
              current,
            ) =>
              !current,
          )
        }
        className="flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-lg border border-[#DFE3DE] bg-white px-4 text-sm text-[#59645F]"
      >
        <span className="truncate">
          {
            label
          }
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[999] max-h-[320px] min-w-[210px] overflow-y-auto rounded-xl border border-[#E1E4DF] bg-white p-1.5 shadow-[0_14px_35px_rgba(25,35,30,0.14)]">
          {
            children
          }
        </div>
      )}
    </div>
  );
}