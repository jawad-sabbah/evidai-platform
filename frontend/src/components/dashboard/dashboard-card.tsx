

export function DashboardCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E3E6E2] bg-white p-6 shadow-[0_4px_18px_rgba(28,40,34,0.03)]">
      {children}
    </div>
  );
}