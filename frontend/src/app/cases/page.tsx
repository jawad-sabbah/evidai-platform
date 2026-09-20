"use client";

import Link from "next/link";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

const cases = [
  {
    id: "1",
    caseNumber: "INV-2026-001",
    title: "Suspicious Payments Investigation",
    description: "Review of unusual financial transfers and related parties.",
    status: "OPEN",
    evidenceCount: 146,
    memberCount: 4,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    caseNumber: "INV-2026-002",
    title: "Vendor Fraud Review",
    description: "Assessment of procurement irregularities and vendor activity.",
    status: "IN_REVIEW",
    evidenceCount: 87,
    memberCount: 3,
    updatedAt: "5 hours ago",
  },
  {
    id: "3",
    caseNumber: "INV-2026-003",
    title: "Offshore Transfers",
    description: "Investigation into cross-border transfers and linked entities.",
    status: "OPEN",
    evidenceCount: 210,
    memberCount: 5,
    updatedAt: "1 day ago",
  },
  {
    id: "4",
    caseNumber: "INV-2026-004",
    title: "Expense Investigation",
    description: "Internal review of employee expense activity.",
    status: "CLOSED",
    evidenceCount: 34,
    memberCount: 2,
    updatedAt: "3 days ago",
  },
];

export default function CasesPage() {

const [statusFilter, setStatusFilter] = useState("All statuses");
const [statusOpen, setStatusOpen] = useState(false);

const [search,setSearch] = useState("");

//search based on caseNumber or title
const searchedCases = cases.filter((item) =>
  item.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
  item.title.toLowerCase().includes(search.toLowerCase())
);

  return (
    <AppShell>
      <div className="px-10 py-9">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#74807A]">
                Investigation Workspace
              </div>

              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-[#18201D]">
                Cases
              </h1>

              <p className="mt-2 text-sm text-[#69736F]">
                Manage and review active investigations.
              </p>
            </div>

            <Link
              href="/cases/new"
              className="rounded-lg bg-[#0F4C3A] px-4 py-2.5 text-sm font-medium text-white     transition hover:bg-[#0A382B]"
            >
              + New case
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <input
              placeholder="Search cases..."
              className="h-10 w-full max-w-md rounded-lg border border-[#E2E4DF] bg-white px-3 text-sm outline-none focus:border-[#9CB5A7]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
           

            <div className="relative">
                <button
                  onClick={() => setStatusOpen((open) => !open)}
                  className="flex h-10 min-w-[150px] items-center justify-between gap-3 rounded-lg border border-[#E2E4DF] bg-white px-4 text-sm text-[#59635F] transition hover:bg-[#F7F7F3]"
                >
                  {statusFilter}

                  <ChevronDown
                    size={15}
                    className={`transition-transform ${
                      statusOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {statusOpen && (
                  <div className="absolute left-0 top-12 z-20 w-[180px] overflow-hidden rounded-xl border border-[#E2E4DF] bg-white p-1.5 shadow-lg">
                    {[
                      "All statuses",
                      "open",
                      "In review",
                      "closed",
                      "archived",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setStatusOpen(false);
                        }}
                        className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-[#59635F] transition hover:bg-[#F3F5F1] hover:text-[#18201D]"
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>

          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-[#E6E7E2] bg-white">
            <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr] border-b border-[#E6E7E2] bg-[#FAFAF7] px-6 py-3 text-xs font-medium uppercase tracking-wide text-[#8A938E]">
              <div>Case</div>
              <div>Status</div>
              <div>Evidence</div>
              <div>Updated</div>
            </div>


            {/*Display a message when no cases are found*/}
            {searchedCases.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-[#8A938E]">
                  No cases found.
                </div>
            )}

            {/*Display a message when no cases with this status are found*/}
           {statusFilter !== "All statuses" &&
            searchedCases.filter(
              (item) => item.status.toLowerCase() === statusFilter
            ).length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-[#8A938E]">
                No cases found for the {statusFilter} status.
              </div>
            )}

            {searchedCases
              .filter(
                (item) =>
                  statusFilter === "All statuses" ||
                  item.status.toLocaleLowerCase() === statusFilter
              )
              .map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2.4fr_1fr_1fr_1fr] items-center border-b border-[#ECEDE9] px-6 py-5 last:border-b-0 hover:bg-[#FCFCF9]"
              >
                <div>
                  <div className="text-xs font-medium text-[#7A8580]">
                    {item.caseNumber}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[#18201D]">
                    {item.title}
                  </div>

                  <div className="mt-1 max-w-xl text-xs text-[#8A938E]">
                    {item.description}
                  </div>

                  <div className="mt-2 text-xs text-[#9AA29E]">
                    {item.memberCount} investigators
                  </div>
                </div>

                <div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="text-sm font-medium text-[#36413C]">
                  {item.evidenceCount}
                </div>

                <div className="text-sm text-[#7C8581]">
                  {item.updatedAt}
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-[#E8EFEA] text-[#0F4C3A]",
    IN_REVIEW: "bg-[#F4EEDC] text-[#9A731E]",
    CLOSED: "bg-[#EEEEEA] text-[#656D69]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}