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
    <div className="min-h-screen bg-[#F7F7F3]">
      {/* FIXED SIDEBAR */}
      <div className="fixed left-0 top-0 z-40 h-screen w-[236px]">
        <Sidebar />
      </div>

      {/* MAIN AREA */}
      <div className="ml-[236px] flex min-h-screen flex-col">
        {showTopbar && (
          <div className="sticky top-0 z-30">
            <Topbar />
          </div>
        )}

        <main className="min-h-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}