"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Search,
  User,
  Building2,
  CreditCard,
  MapPin,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

const pages = [
  { id: 1, label: "Page 1" },
  { id: 2, label: "Page 2" },
  { id: 3, label: "Page 3" },
  { id: 4, label: "Page 4" },
];

const mentions = [
  {
    id: "m1",
    type: "PERSON",
    name: "John Smith",
    count: 3,
  },
  {
    id: "m2",
    type: "ORGANIZATION",
    name: "ACME Ltd",
    count: 2,
  },
  {
    id: "m3",
    type: "BANK_ACCOUNT",
    name: "Account 3281",
    count: 1,
  },
  {
    id: "m4",
    type: "LOCATION",
    name: "London",
    count: 1,
  },
];

export default function EvidenceViewerPage() {
  const { caseId, evidenceId } = useParams<{
    caseId: string;
    evidenceId: string;
  }>();

  return (
    <AppShell showTopbar={false}>
      <div className="flex h-screen flex-col bg-[#F7F7F3]">
        {/* TOP BAR */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#E4E6E2] bg-white px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/cases/${caseId}/evidence`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#59645F] hover:text-[#0F4C3A]"
            >
              <ArrowLeft size={16} />
              Back to evidence
            </Link>

            <div className="h-5 w-px bg-[#E0E3DE]" />

            <div>
              <div className="text-sm font-semibold text-[#26312C]">
                bank_statement.pdf
              </div>

              <div className="text-[11px] text-[#929A96]">
                Evidence ID: {evidenceId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E3DE] bg-white text-[#59645F] hover:bg-[#F4F5F1]">
              <Search size={15} />
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E3DE] bg-white text-[#59645F] hover:bg-[#F4F5F1]">
              <Download size={15} />
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E3DE] bg-white text-[#59645F] hover:bg-[#F4F5F1]">
              <Maximize2 size={15} />
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid min-h-0 flex-1 grid-cols-[110px_minmax(0,1fr)_330px]">
          {/* LEFT PAGES */}
          <aside className="overflow-y-auto border-r border-[#E4E6E2] bg-[#FAFAF7] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
              Pages
            </div>

            <div className="mt-3 space-y-3">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`w-full rounded-lg border p-2 ${
                    page.id === 1
                      ? "border-[#0F4C3A] bg-white"
                      : "border-[#E1E4DF] bg-white hover:border-[#A7B7AF]"
                  }`}
                >
                  <div className="flex aspect-[3/4] items-center justify-center rounded-md bg-[#F2F3EF]">
                    <FileText
                      size={22}
                      className="text-[#9AA29E]"
                    />
                  </div>

                  <div className="mt-2 text-[10px] text-[#66716B]">
                    {page.label}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* DOCUMENT AREA */}
          <section className="relative flex min-h-0 flex-col bg-[#ECEDEA]">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#DDE0DC] bg-white px-5">
              <div className="flex items-center gap-2 text-xs text-[#65716B]">
                <span>Page</span>

                <span className="font-semibold text-[#26312C]">
                  1
                </span>

                <span>of</span>

                <span>42</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E1E4DF] text-[#66716B]">
                  <ChevronLeft size={15} />
                </button>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E1E4DF] text-[#66716B]">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-8">
              <div className="mx-auto min-h-[950px] max-w-[760px] bg-white p-14 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="border-b border-[#DDE1DC] pb-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                    Official Bank Statement
                  </div>

                  <h2 className="mt-3 text-xl font-semibold text-[#18201D]">
                    Account Statement
                  </h2>

                  <p className="mt-1 text-sm text-[#7A8580]">
                    March 2026
                  </p>
                </div>

                <div className="mt-8">
                  <div className="grid grid-cols-3 border-b border-[#E5E8E4] pb-2 text-xs font-semibold text-[#66716B]">
                    <div>Date</div>
                    <div>Description</div>
                    <div className="text-right">Amount</div>
                  </div>

                  <div className="grid grid-cols-3 py-4 text-sm text-[#4E5A54]">
                    <div>12 Mar 2026</div>
                    <div>Transfer to ACME Ltd</div>
                    <div className="text-right font-semibold">
                      $100,000
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-[#ECEDE9] py-4 text-sm text-[#4E5A54]">
                    <div>18 Mar 2026</div>
                    <div>International transfer</div>
                    <div className="text-right font-semibold">
                      $42,500
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-lg bg-[#FFF8E8] p-4">
                  <div className="text-xs font-semibold text-[#946E23]">
                    Highlighted extraction
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#645B46]">
                    Transfer of $100,000 from Account 3281 to ACME Ltd.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT ANALYSIS */}
          <aside className="flex min-h-0 flex-col border-l border-[#E4E6E2] bg-white">
            <div className="shrink-0 border-b border-[#E7E9E5] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#26312C]">
                Extracted Intelligence
              </h3>

              <p className="mt-1 text-xs text-[#8A938E]">
                Entities and facts detected on this page.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                  Entities
                </div>

                <div className="mt-3 space-y-3">
                  {mentions.map((mention) => (
                    <EntityMention
                      key={mention.id}
                      type={mention.type}
                      name={mention.name}
                      count={mention.count}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                  Detected Event
                </div>

                <div className="mt-3 rounded-lg border border-[#E6E9E5] bg-[#FAFAF7] p-4">
                  <div className="text-sm font-semibold text-[#35413B]">
                    $100,000 transfer
                  </div>

                  <div className="mt-1 text-xs text-[#87908B]">
                    12 Mar 2026 · 14:28
                  </div>

                  <div className="mt-3 text-xs leading-5 text-[#68736E]">
                    John Smith → ACME Ltd
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                  Related Claim
                </div>

                <div className="mt-3 rounded-lg border border-[#E6E9E5] bg-[#FAFAF7] p-4">
                  <div className="text-sm font-semibold leading-5 text-[#35413B]">
                    “The payment was for consulting services.”
                  </div>

                  <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#A77722]">
                    Disputed
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function EntityMention({
  type,
  name,
  count,
}: {
  type: string;
  name: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#E6E9E5] bg-[#FCFCFA] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
          <EntityIcon type={type} />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#35413B]">
            {name}
          </div>

          <div className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-[#929A96]">
            {type.replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="text-xs text-[#87908B]">
        {count} {count === 1 ? "mention" : "mentions"}
      </div>
    </div>
  );
}

function EntityIcon({
  type,
}: {
  type: string;
}) {
  switch (type) {
    case "PERSON":
      return <User size={14} />;

    case "ORGANIZATION":
      return <Building2 size={14} />;

    case "BANK_ACCOUNT":
      return <CreditCard size={14} />;

    case "LOCATION":
      return <MapPin size={14} />;

    default:
      return <FileText size={14} />;
  }
}