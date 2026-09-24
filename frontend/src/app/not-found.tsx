import Link from "next/link";

import {
  ArrowLeft,
  Home,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F7F3] px-6">
      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-[360px] w-[360px] rounded-full border-[56px] border-[#E6EEE9]" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full border-[64px] border-[#EAF1EC]" />

      {/* CONTENT */}

      <div className="relative z-10 w-full max-w-[760px] text-center">
        {/* LOGO */}

        <Link
          href="/"
          className="mx-auto inline-flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C3A] text-white shadow-sm">
            <ShieldCheck size={19} />
          </div>

          <div className="text-left">
            <div className="text-lg font-semibold tracking-[-0.03em] text-[#183128]">
              EvidAI
            </div>

            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8B9690]">
              Investigation Intelligence
            </div>
          </div>
        </Link>

        {/* ERROR NUMBER */}

        <div className="mt-10">
          <div className="text-[92px] font-semibold leading-none tracking-[-0.07em] text-[#D6E3DB] sm:text-[120px]">
            404
          </div>
        </div>

        {/* TITLE */}

        <div className="-mt-2">
          <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#183128] sm:text-[38px]">
            This page could not be found.
          </h1>

          <p className="mx-auto mt-4 max-w-[580px] text-sm leading-7 text-[#738079]">
            The address may be incorrect, the page may have moved, or the
            resource may no longer be available. You can return to the
            dashboard or continue browsing EvidAI.
          </p>
        </div>

        {/* ACTIONS */}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F4C3A] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(15,76,58,0.12)] transition hover:-translate-y-0.5 hover:bg-[#0A382B]"
          >
            <Home size={15} />

            Go to Dashboard
          </Link>

          <Link
            href="/cases"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D7DDD8] bg-white px-5 text-sm font-semibold text-[#52605A] transition hover:border-[#BBC9C0] hover:bg-[#FAFBF9]"
          >
            <Search size={15} />

            Browse Cases
          </Link>

          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 px-3 text-sm font-medium text-[#67766E] transition hover:text-[#0F4C3A]"
          >
            <ArrowLeft size={14} />

            Back to Home
          </Link>
        </div>

        {/* HELP CARD */}

        <div className="mx-auto mt-10 max-w-[560px] rounded-2xl border border-[#DEE6E0] bg-[#EEF4F0] p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F4C3A] shadow-sm">
              <Search size={15} />
            </div>

            <div>
              <div className="text-sm font-semibold text-[#365044]">
                Looking for an investigation?
              </div>

              <p className="mt-1 text-xs leading-5 text-[#738079]">
                Use the Cases workspace to find an existing investigation, or
                open the Evidence Center to search across uploaded material.
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/cases"
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Open Cases
                </Link>

                <Link
                  href="/evidence"
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  Open Evidence
                </Link>

                <Link
                  href="/ai"
                  className="text-xs font-semibold text-[#0F4C3A] hover:underline"
                >
                  AI Investigator
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-8 text-[10px] text-[#98A09C]">
          EvidAI · Investigation Intelligence Platform
        </div>
      </div>
    </main>
  );
}