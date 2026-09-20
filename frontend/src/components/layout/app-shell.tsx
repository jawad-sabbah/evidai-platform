import { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type AppShellProps = {
  children: ReactNode;
  showTopbar?: boolean;
};

export function AppShell({
  children,
  showTopbar = true,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#F7F7F3]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {showTopbar && <Topbar />}

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}