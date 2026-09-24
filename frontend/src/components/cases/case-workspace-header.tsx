"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type CaseWorkspaceHeaderProps = {
  caseId: string;
  caseNumber: string;
  title: string;
  status: "OPEN" | "IN_REVIEW" | "CLOSED" | "ARCHIVED";
  showHeader?: boolean;
};

const tabs = [
  { label: "Overview", path: "" },
  { label: "Evidence", path: "/evidence" },
  { label: "Entities", path: "/entities" },
  { label: "Graph", path: "/graph" },
  { label: "Timeline", path: "/timeline" },
  { label: "Claims", path: "/claims" },
  { label: "Flags", path: "/flags" },
  { label: "Findings", path: "/findings" },
  { label: "Reports", path: "/reports" },
];

export function CaseWorkspaceHeader({
  caseId,
  caseNumber,
  title,
  status,
  showHeader = true,
}: CaseWorkspaceHeaderProps) {
  const pathname = usePathname();

  if (!showHeader) {
    return null;
  }

  const statusStyles = {
    OPEN: "bg-[#E7F2EC] text-[#19704F]",
    IN_REVIEW: "bg-[#F4EEDC] text-[#9A731E]",
    CLOSED: "bg-[#EEEEEA] text-[#656D69]",
    ARCHIVED: "bg-[#ECECEC] text-[#737373]",
  };

  return (
    <div>
      <Link
        href="/cases"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#66716B] transition hover:text-[#0F4C3A]"
      >
        <ArrowLeft size={16} />
        Back to cases
      </Link>

      <div className="mt-5 flex items-center gap-3">
        <h1 className="text-[34px] font-semibold tracking-[-0.035em] text-[#18201D]">
          {caseNumber}
        </h1>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
        >
          {status.replace("_", " ")}
        </span>
      </div>

      <p className="mt-1 text-sm text-[#7A8580]">
        {title}
      </p>

      <div className="mt-6 border-b border-[#E2E5E0]">
        <div className="flex gap-7 overflow-x-auto">
          {tabs.map((tab) => {
            const href = `/cases/${caseId}${tab.path}`;

            const active =
              tab.path === ""
                ? pathname === `/cases/${caseId}`
                : pathname.startsWith(href);

            return (
              <Link
                key={tab.label}
                href={href}
                className={`relative pb-3 text-sm font-medium transition ${
                  active
                    ? "text-[#0F4C3A]"
                    : "text-[#78827D] hover:text-[#36413C]"
                }`}
              >
                {tab.label}

                {active && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#0F4C3A]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}