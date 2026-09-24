"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Flag,
  Network,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

const recentEvidence = [
  {
    id: "1",
    name: "bank_statement.pdf",
    type: "PDF",
    updatedAt: "2h ago",
  },
  {
    id: "2",
    name: "offshore_contract.docx",
    type: "DOCX",
    updatedAt: "5h ago",
  },
  {
    id: "3",
    name: "transactions.csv",
    type: "CSV",
    updatedAt: "1d ago",
  },
  {
    id: "4",
    name: "email_thread.eml",
    type: "EML",
    updatedAt: "2d ago",
  },
];


export default function CaseOverviewPage() {
  return (
    <AppShell showTopbar={false}>
      <div className="h-full overflow-y-auto bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1380px] px-8 py-6">
          
          <CaseWorkspaceHeader
            caseId="1"
            caseNumber="INV-2026-001"
            title="Suspicious Payments Investigation"
            status="OPEN"
          />

          {/* MAIN GRID */}
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_310px] gap-6">
            {/* LEFT CONTENT */}
            <div className="min-w-0">
              {/* METRICS */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  icon={<FileText size={18} />}
                  value="146"
                  label="Evidence Files"
                />

                <MetricCard
                  icon={<Network size={18} />}
                  value="324"
                  label="Entities Detected"
                />

                <MetricCard
                  icon={<Users size={18} />}
                  value="87"
                  label="Events Detected"
                />

                <MetricCard
                  icon={<ShieldCheck size={18} />}
                  value="12"
                  label="Findings"
                />
              </div>

              {/* LOWER CONTENT */}
              <div className="mt-5 grid grid-cols-[1.15fr_1fr] gap-5">
                {/* SUMMARY */}
                <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
                  <h2 className="text-sm font-semibold text-[#26312C]">
                    Case Summary
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#68736E]">
                    Investigation into suspicious payments made to offshore
                    entities and potentially related parties. Initial analysis
                    has identified multiple unusual transfers and possible shell
                    companies requiring review.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-[#ECEDE9] pt-5">
                    <InfoItem label="Owner" value="Alex Morgan" />
                    <InfoItem label="Created" value="Mar 12, 2026" />
                    <InfoItem label="Last Updated" value="4 hours ago" />
                    <InfoItem label="Case Type" value="Financial Crime" />
                    {/*<InfoItem label="Priority" value="High" />*/}
                    <InfoItem label="Members" value="4 investigators" />
                  </div>
                </section>

                {/* RECENT EVIDENCE */}
                <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#26312C]">
                      Recent Evidence
                    </h2>

                    <Link href={`1/evidence`} className="text-xs font-medium text-[#0F4C3A]">
                      View all evidence →
                    </Link>
                  </div>

                  <div className="mt-4 divide-y divide-[#ECEDE9]">
                    {recentEvidence.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
                            <FileText size={15} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[#35413B]">
                              {item.name}
                            </div>

                            <div className="mt-0.5 text-xs text-[#929A96]">
                              {item.type}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 shrink-0 text-xs text-[#929A96]">
                          {item.updatedAt}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href={`1/evidence`} className="mt-4 text-xs font-medium text-[#0F4C3A]">
                    View all evidence →
                  </Link>
                </section>
              </div>

              {/* FLAGS */}
              <section className="mt-5 rounded-xl border border-[#E4E6E2] bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[#26312C]">
                      Priority Flags
                    </h2>

                    <p className="mt-1 text-xs text-[#8A938E]">
                      Items requiring investigator attention.
                    </p>
                  </div>

                  <Link href={`1/flags`} className="text-xs font-medium text-[#0F4C3A]">
                    View flags
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <FlagCard
                    severity="CRITICAL"
                    title="Possible undisclosed ownership"
                  />

                  <FlagCard
                    severity="HIGH"
                    title="Unusual payment pattern"
                  />

                  <FlagCard
                    severity="HIGH"
                    title="Conflicting testimony"
                  />
                </div>
              </section>
            </div>

            {/* RIGHT CONTEXT PANEL */}
            <aside className="overflow-hidden rounded-xl border border-[#E4E6E2] bg-[#F2F4EF]">
              <div className="relative min-h-[540px]">
                <div
                  className="absolute inset-0 opacity-55"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 15%, rgba(15,76,58,0.12), transparent 34%), radial-gradient(circle at 20% 70%, rgba(15,76,58,0.07), transparent 30%)",
                  }}
                />

                <div className="absolute inset-0 opacity-40">
                  <div className="absolute left-[18%] top-[19%] h-2 w-2 rounded-full bg-[#4F8573]" />
                  <div className="absolute left-[55%] top-[27%] h-2 w-2 rounded-full bg-[#4F8573]" />
                  <div className="absolute right-[15%] top-[18%] h-2 w-2 rounded-full bg-[#4F8573]" />
                  <div className="absolute left-[35%] top-[45%] h-2 w-2 rounded-full bg-[#4F8573]" />
                  <div className="absolute right-[28%] top-[55%] h-2 w-2 rounded-full bg-[#4F8573]" />

                  <div className="absolute left-[19%] top-[21%] h-px w-[110px] rotate-[12deg] bg-[#9EB5AA]" />
                  <div className="absolute left-[39%] top-[38%] h-px w-[100px] rotate-[29deg] bg-[#9EB5AA]" />
                </div>

                <div className="relative flex h-full min-h-[540px] flex-col px-7 py-7">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#82908A]">
                      Investigation Context
                    </div>

                    <h3 className="mt-3 text-[25px] font-medium leading-[1.15] tracking-[-0.03em] text-[#254137]">
                      Connections
                      <br />
                      create context.
                    </h3>
                  </div>

                  <div className="mt-auto">
                    <div className="rounded-xl border border-white/60 bg-white/65 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Search size={15} className="text-[#0F4C3A]" />

                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#587267]">
                          Quick insight
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-5 text-[#5E6D66]">
                        324 entities and 87 timeline events have been detected
                        across this investigation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-[#E4E6E2] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A]">
          {icon}
        </div>

        <div>
          <div className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-[#18201D]">
            {value}
          </div>

          <div className="mt-2 text-xs font-medium text-[#75807A]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#929A96]">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-[#35413B]">
        {value}
      </div>
    </div>
  );
}

function FlagCard({
  severity,
  title,
}: {
  severity: string;
  title: string;
}) {
  const isCritical = severity === "CRITICAL";

  return (
    <div className="rounded-lg border border-[#ECE4DF] bg-[#FCFAF8] p-4">
      <div className="flex items-center gap-2">
        <Flag
          size={14}
          className={
            isCritical
              ? "text-[#B95043]"
              : "text-[#C68C2E]"
          }
        />

        <span
          className={`text-[10px] font-semibold tracking-[0.08em] ${
            isCritical
              ? "text-[#B95043]"
              : "text-[#A97826]"
          }`}
        >
          {severity}
        </span>
      </div>

      <div className="mt-2 text-sm font-medium leading-5 text-[#36413C]">
        {title}
      </div>
    </div>
  );
}