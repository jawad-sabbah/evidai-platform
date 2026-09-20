import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <div className="px-10 py-9">
        <div className="max-w-7xl">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#74807A]">
            Investigation Workspace
          </div>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.035em] text-[#18201D]">
                Good morning, Jawad.
              </h1>

              <p className="mt-2 text-sm text-[#69736F]">
                Here what requires your attention across EvidAI.
              </p>
            </div>

            <button className="rounded-lg bg-[#0F4C3A] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A382B]">
              + New case
            </button>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-4">
            <Metric
              label="Active Cases"
              value="12"
              description="Across your workspace"
            />

            <Metric
              label="Evidence Files"
              value="486"
              description="38 added this week"
            />

            <Metric
              label="Open Flags"
              value="17"
              description="5 require review"
            />

            <Metric
              label="Pending Findings"
              value="24"
              description="12 need verification"
            />
          </div>

          <div className="mt-8 grid grid-cols-[1.7fr_1fr] gap-5">
            <section className="rounded-xl border border-[#E6E7E2] bg-white p-6">
              <div>
                <h2 className="text-base font-semibold">Recent investigations</h2>

                <p className="mt-1 text-xs text-[#818A85]">
                  Cases recently updated by your team.
                </p>
              </div>

              <div className="mt-5 divide-y divide-[#ECEDE9]">
                <CaseRow
                  number="INV-2026-001"
                  name="Suspicious Payments Investigation"
                  status="Open"
                />

                <CaseRow
                  number="INV-2026-002"
                  name="Vendor Fraud Review"
                  status="In Review"
                />

                <CaseRow
                  number="INV-2026-003"
                  name="Procurement Investigation"
                  status="Open"
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#E6E7E2] bg-white p-6">
              <h2 className="text-base font-semibold">Needs attention</h2>

              <div className="mt-5 space-y-4">
                <AttentionItem value="3" label="Critical flags" />
                <AttentionItem value="8" label="Unreviewed claims" />
                <AttentionItem value="2" label="Failed documents" />
                <AttentionItem value="5" label="Findings pending review" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#E6E7E2] bg-white p-5">
      <div className="text-xs font-medium text-[#707A75]">{label}</div>

      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>

      <div className="mt-2 text-xs text-[#9AA29E]">{description}</div>
    </div>
  );
}

function CaseRow({
  number,
  name,
  status,
}: {
  number: string;
  name: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div>
        <div className="text-xs font-medium text-[#7B8580]">{number}</div>

        <div className="mt-1 text-sm font-medium text-[#18201D]">{name}</div>
      </div>

      <span className="rounded-full bg-[#E8EFEA] px-2.5 py-1 text-[11px] font-medium text-[#0F4C3A]">
        {status}
      </span>
    </div>
  );
}

function AttentionItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#59635F]">{label}</span>

      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#F4ECE8] px-2 text-xs font-semibold text-[#A95842]">
        {value}
      </span>
    </div>
  );
}