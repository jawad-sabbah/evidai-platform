export function AiSuggestion({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-[#D7E2DB] bg-white/60 px-2.5 py-1 text-[10px] font-medium text-[#60736A]">
      {children}
    </span>
  );
}