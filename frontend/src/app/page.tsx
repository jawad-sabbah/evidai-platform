"use client";

import Link from "next/link";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  Flag,
  GitBranch,
  Layers3,
  MessageSquareQuote,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type WorkflowStep = {
  number: string;
  title: string;
  description: string;
};

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type IntelligenceItem = {
  label: string;
  description: string;
  icon: React.ReactNode;
};

/* =========================================================
   DATA
========================================================= */

const workflowSteps: WorkflowStep[] = [
  {
    number: "01",
    title: "Create an investigation",
    description:
      "Start a structured case workspace with a case number, type, description and investigation team.",
  },
  {
    number: "02",
    title: "Upload evidence",
    description:
      "Add documents, spreadsheets, communications, images and other case material into one evidence workspace.",
  },
  {
    number: "03",
    title: "Process intelligence",
    description:
      "EvidAI extracts entities, relationships, events, claims and investigative signals from processed evidence.",
  },
  {
    number: "04",
    title: "Review AI analysis",
    description:
      "Investigators review extracted entities, claims, flags and supporting evidence before accepting important conclusions.",
  },
  {
    number: "05",
    title: "Build verified findings",
    description:
      "Potential issues can be converted into findings and verified through human review and supporting evidence.",
  },
  {
    number: "06",
    title: "Generate reports",
    description:
      "Create evidence-grounded investigation reports from verified findings, edit the draft and finalize the reviewed version.",
  },
];

const features: Feature[] = [
  {
    title: "Evidence-first investigations",
    description:
      "Every important insight stays connected to its original source, document and page.",
    icon: <FileSearch size={20} />,
  },
  {
    title: "AI Investigator",
    description:
      "Ask questions across case evidence and structured intelligence with source-backed responses.",
    icon: <Sparkles size={20} />,
  },
  {
    title: "Relationship intelligence",
    description:
      "Explore people, organizations, accounts and their connections through an investigation graph.",
    icon: <Network size={20} />,
  },
  {
    title: "Human review workflow",
    description:
      "Separate machine-generated analysis from investigator-reviewed entities, claims and findings.",
    icon: <ShieldCheck size={20} />,
  },
  {
    title: "Case-wide timeline",
    description:
      "Bring events from multiple evidence sources together into one chronological investigation view.",
    icon: <GitBranch size={20} />,
  },
  {
    title: "Evidence-grounded reports",
    description:
      "Generate formal reports using reviewed findings and traceable supporting citations.",
    icon: <FileText size={20} />,
  },
];

const intelligenceItems: IntelligenceItem[] = [
  {
    label: "Entities",
    description:
      "People, organizations, accounts, emails and other important objects.",
    icon: <Users size={17} />,
  },
  {
    label: "Relationships",
    description:
      "Connections between entities discovered across case evidence.",
    icon: <Network size={17} />,
  },
  {
    label: "Timeline",
    description:
      "Events organized chronologically across the complete investigation.",
    icon: <GitBranch size={17} />,
  },
  {
    label: "Claims",
    description:
      "Statements and assertions evaluated against available evidence.",
    icon: <MessageSquareQuote size={17} />,
  },
  {
    label: "Flags",
    description:
      "Potential investigative issues requiring investigator attention.",
    icon: <Flag size={17} />,
  },
  {
    label: "Findings",
    description:
      "Formal conclusions that have passed through investigator review.",
    icon: <ShieldCheck size={17} />,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F7F3] text-[#18201D]">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="relative z-50 border-b border-[#E2E6E1] bg-[#F7F7F3]/90 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          {/* BRAND */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C3A] text-white shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-[#19372C]">
                EvidAI
              </div>

              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B9690]">
                Investigation Intelligence
              </div>
            </div>
          </Link>

          {/* DESKTOP LINKS */}

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#platform"
              className="text-sm font-medium text-[#66736C] transition hover:text-[#0F4C3A]"
            >
              Platform
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-[#66736C] transition hover:text-[#0F4C3A]"
            >
              How it works
            </a>

            <a
              href="#intelligence"
              className="text-sm font-medium text-[#66736C] transition hover:text-[#0F4C3A]"
            >
              Intelligence
            </a>

            <a
              href="#guide"
              className="text-sm font-medium text-[#66736C] transition hover:text-[#0F4C3A]"
            >
              Guide
            </a>
          </nav>

          {/* AUTH */}

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-[#405049] transition hover:bg-white sm:inline-flex"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0A382B]"
            >
              Get Started

              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative">
        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -right-[180px] top-[40px] h-[540px] w-[540px] rounded-full border-[80px] border-[#E7EEE9]" />

        <div className="pointer-events-none absolute -left-[220px] top-[410px] h-[420px] w-[420px] rounded-full border-[70px] border-white" />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_0.95fr] lg:px-10 lg:py-28">
          {/* HERO COPY */}

          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E1D8] bg-[#EEF4F0] px-3 py-1.5">
              <Sparkles
                size={12}
                className="text-[#0F4C3A]"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#567064]">
                Evidence-grounded investigation intelligence
              </span>
            </div>

            <h1 className="mt-7 text-[48px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#153127] sm:text-[58px] lg:text-[68px]">
              Turn complex evidence into
              <span className="block text-[#0F4C3A]">
                clear investigative intelligence.
              </span>
            </h1>

            <p className="mt-7 max-w-[650px] text-[17px] leading-8 text-[#6A7871]">
              EvidAI helps investigators organize evidence, discover
              relationships, review claims, identify investigative issues and
              build evidence-backed findings — while keeping every important
              insight traceable to its source.
            </p>

            {/* CTA */}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0F4C3A] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,76,58,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0A382B]"
              >
                Create your account

                <ArrowRight size={15} />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#D5DDD7] bg-white px-6 text-sm font-semibold text-[#405049] transition hover:border-[#B8C8BF] hover:bg-[#FBFCFA]"
              >
                Log in
              </Link>

              <a
                href="#workflow"
                className="inline-flex h-12 items-center gap-2 px-3 text-sm font-medium text-[#63736B] hover:text-[#0F4C3A]"
              >
                See how it works

                <ArrowRight size={14} />
              </a>
            </div>

            {/* TRUST POINTS */}

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              <HeroCheck>
                Human-reviewed intelligence
              </HeroCheck>

              <HeroCheck>
                Source-linked evidence
              </HeroCheck>

              <HeroCheck>
                Case-scoped AI analysis
              </HeroCheck>
            </div>
          </div>

          {/* HERO PRODUCT PREVIEW */}

          <div className="relative">
            <div className="absolute -inset-5 rounded-[32px] bg-[#EAF1EC]" />

            <div className="relative overflow-hidden rounded-[26px] border border-[#DCE4DE] bg-white shadow-[0_30px_80px_rgba(24,49,39,0.12)]">
              {/* APP TOP */}

              <div className="flex items-center justify-between border-b border-[#E9ECE8] bg-[#FCFCFA] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F4C3A] text-white">
                    <ShieldCheck size={13} />
                  </div>

                  <span className="text-xs font-semibold text-[#324139]">
                    Suspicious Payments Investigation
                  </span>
                </div>

                <span className="rounded-full bg-[#E7F2EC] px-2.5 py-1 text-[8px] font-semibold text-[#19704F]">
                  OPEN
                </span>
              </div>

              {/* APP */}

              <div className="grid grid-cols-[145px_1fr]">
                {/* MOCK SIDEBAR */}

                <div className="border-r border-[#ECEEEB] bg-[#FAFAF7] p-3">
                  <MockNav active>
                    Overview
                  </MockNav>

                  <MockNav>
                    Evidence
                  </MockNav>

                  <MockNav>
                    Entities
                  </MockNav>

                  <MockNav>
                    Graph
                  </MockNav>

                  <MockNav>
                    Timeline
                  </MockNav>

                  <MockNav>
                    Claims
                  </MockNav>

                  <MockNav>
                    Flags
                  </MockNav>

                  <MockNav>
                    Findings
                  </MockNav>

                  <MockNav>
                    Reports
                  </MockNav>
                </div>

                {/* CONTENT */}

                <div className="min-w-0 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#929A96]">
                        Case intelligence
                      </div>

                      <div className="mt-1 text-sm font-semibold text-[#29352F]">
                        Investigation Overview
                      </div>
                    </div>

                    <div className="flex h-8 items-center gap-1.5 rounded-lg bg-[#EEF4F0] px-3 text-[9px] font-semibold text-[#0F4C3A]">
                      <Sparkles size={11} />

                      AI Ready
                    </div>
                  </div>

                  {/* METRICS */}

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <MockMetric
                      value="24"
                      label="Evidence"
                    />

                    <MockMetric
                      value="18"
                      label="Entities"
                    />

                    <MockMetric
                      value="6"
                      label="Findings"
                    />
                  </div>

                  {/* NETWORK */}

                  <div className="mt-4 rounded-xl border border-[#E8EAE7] bg-[#FAFAF7] p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-semibold text-[#48554E]">
                        Relationship intelligence
                      </div>

                      <Network
                        size={12}
                        className="text-[#0F4C3A]"
                      />
                    </div>

                    <div className="relative mt-5 h-[155px]">
                      <MockNode
                        className="left-[4%] top-[34%]"
                        label="John Smith"
                      />

                      <MockNode
                        className="left-[42%] top-[4%]"
                        label="ACME Ltd"
                        strong
                      />

                      <MockNode
                        className="right-[2%] top-[48%]"
                        label="Global Holdings"
                      />

                      <MockNode
                        className="left-[38%] bottom-[0]"
                        label="Account 3281"
                      />

                      <div className="absolute left-[27%] top-[48%] h-px w-[22%] rotate-[-17deg] bg-[#B5C5BC]" />

                      <div className="absolute left-[54%] top-[38%] h-px w-[28%] rotate-[20deg] bg-[#B5C5BC]" />

                      <div className="absolute left-[27%] top-[67%] h-px w-[25%] rotate-[24deg] bg-[#B5C5BC]" />
                    </div>
                  </div>

                  {/* FINDING */}

                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-[#DDE8E1] bg-[#F1F6F3] p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#DDECE3] text-[#0F4C3A]">
                      <ShieldCheck size={12} />
                    </div>

                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#718078]">
                        Verified finding
                      </div>

                      <div className="mt-1 text-[10px] font-medium leading-4 text-[#415048]">
                        Corporate relationship supported by registry and
                        contractual evidence.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM
      ===================================================== */}

      <section
        id="platform"
        className="border-y border-[#E5E8E4] bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <SectionIntro
            eyebrow="The platform"
            title="One workspace for the complete investigation lifecycle."
            description="EvidAI brings evidence, structured intelligence, human review and reporting together so investigators can move from raw material to defensible conclusions without losing source traceability."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW GUIDE
      ===================================================== */}

      <section
        id="workflow"
        className="bg-[#F7F7F3]"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            {/* LEFT */}

            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E0D9] bg-white px-3 py-1.5">
                <Layers3
                  size={12}
                  className="text-[#0F4C3A]"
                />

                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#63756C]">
                  System guide
                </span>
              </div>

              <h2 className="mt-5 max-w-[490px] text-[40px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#183128]">
                From evidence upload to final report.
              </h2>

              <p className="mt-5 max-w-[520px] text-sm leading-7 text-[#6E7B74]">
                EvidAI is structured around a clear investigation workflow.
                Artificial intelligence helps organize and analyze information,
                while investigators remain responsible for reviewing important
                decisions.
              </p>

              <div className="mt-7 rounded-2xl border border-[#DDE6E0] bg-[#EEF4F0] p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#0F4C3A]"
                  />

                  <div>
                    <div className="text-sm font-semibold text-[#365044]">
                      Human review remains central
                    </div>

                    <p className="mt-1 text-xs leading-5 text-[#708079]">
                      High model confidence does not automatically make an
                      entity confirmed, a flag a finding, or a generated report
                      final.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STEPS */}

            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <WorkflowStepCard
                  key={step.number}
                  step={step}
                  last={
                    index === workflowSteps.length - 1
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTELLIGENCE MODEL
      ===================================================== */}

      <section
        id="intelligence"
        className="bg-[#173C30]"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            {/* COPY */}

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A4C0B4]">
                Investigation intelligence
              </div>

              <h2 className="mt-4 max-w-[580px] text-[40px] font-semibold leading-[1.15] tracking-[-0.04em] text-white">
                Evidence becomes structured, reviewable intelligence.
              </h2>

              <p className="mt-5 max-w-[560px] text-sm leading-7 text-[#B7CAC1]">
                Instead of treating every document as an isolated file, EvidAI
                connects information across the investigation and preserves the
                path back to the original evidence.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91AFA2]">
                  Provenance chain
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/90">
                  <ProvenanceItem>
                    Report
                  </ProvenanceItem>

                  <ArrowRight size={12} />

                  <ProvenanceItem>
                    Finding
                  </ProvenanceItem>

                  <ArrowRight size={12} />

                  <ProvenanceItem>
                    Intelligence
                  </ProvenanceItem>

                  <ArrowRight size={12} />

                  <ProvenanceItem>
                    Evidence
                  </ProvenanceItem>
                </div>
              </div>
            </div>

            {/* INTELLIGENCE GRID */}

            <div className="grid gap-3 sm:grid-cols-2">
              {intelligenceItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#CDE1D7]">
                    {item.icon}
                  </div>

                  <div className="mt-4 text-sm font-semibold text-white">
                    {item.label}
                  </div>

                  <p className="mt-2 text-xs leading-6 text-[#AFC4BA]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          USER GUIDE
      ===================================================== */}

      <section
        id="guide"
        className="bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <SectionIntro
            eyebrow="Quick start guide"
            title="Know exactly where to go inside EvidAI."
            description="The workspace is organized so each part of the investigation has a clear role."
          />

          <div className="mt-12 overflow-hidden rounded-2xl border border-[#E1E5E1]">
            <GuideRow
              number="01"
              title="Dashboard"
              description="See your workload, recent cases, pending reviews, evidence processing and investigation activity."
            />

            <GuideRow
              number="02"
              title="Cases"
              description="Create investigations and access the complete case workspace."
            />

            <GuideRow
              number="03"
              title="Evidence"
              description="Manage uploaded evidence across all cases and inspect processing status."
            />

            <GuideRow
              number="04"
              title="Case Workspace"
              description="Move through Overview, Evidence, Entities, Graph, Timeline, Claims, Flags, Findings and Reports."
            />

            <GuideRow
              number="05"
              title="AI Investigator"
              description="Ask case-scoped questions and inspect answers with evidence citations."
            />

            <GuideRow
              number="06"
              title="Settings"
              description="Manage your personal preferences, notifications and AI response experience."
              last
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CORE PRINCIPLE
      ===================================================== */}

      <section className="bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1180px] px-6 py-24">
          <div className="relative overflow-hidden rounded-[28px] border border-[#D9E4DD] bg-[#EEF4F0] px-7 py-12 text-center sm:px-12 lg:px-20">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[45px] border-white/35" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F4C3A] text-white">
                <ShieldCheck size={20} />
              </div>

              <h2 className="mx-auto mt-5 max-w-[760px] text-[34px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#183128]">
                AI assists the investigation.
                <br />
                Investigators make the decisions.
              </h2>

              <p className="mx-auto mt-5 max-w-[680px] text-sm leading-7 text-[#6A7A72]">
                EvidAI separates machine-generated analysis from
                investigator-reviewed conclusions, helping teams preserve
                accountability and traceability throughout the investigation.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <PrincipleChip>
                  AI confidence ≠ confirmation
                </PrincipleChip>

                <PrincipleChip>
                  Flag ≠ finding
                </PrincipleChip>

                <PrincipleChip>
                  Generated report ≠ final report
                </PrincipleChip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#0F4C3A]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 text-center lg:px-10">
          <div className="mx-auto max-w-[760px]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A6C1B5]">
              Start investigating
            </div>

            <h2 className="mt-4 text-[40px] font-semibold leading-[1.15] tracking-[-0.04em] text-white">
              Bring structure, intelligence and traceability to complex
              investigations.
            </h2>

            <p className="mx-auto mt-5 max-w-[620px] text-sm leading-7 text-[#B7CEC3]">
              Create your EvidAI account or sign in to continue working on your
              investigations.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#0F4C3A] transition hover:-translate-y-0.5"
              >
                Create account

                <ArrowRight size={15} />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#E3E6E2] bg-[#F7F7F3]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F4C3A] text-white">
              <ShieldCheck size={14} />
            </div>

            <div>
              <div className="text-sm font-semibold text-[#294137]">
                EvidAI
              </div>

              <div className="text-[9px] text-[#8C9691]">
                Investigation Intelligence Platform
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#7A8580]">
            <a
              href="#platform"
              className="hover:text-[#0F4C3A]"
            >
              Platform
            </a>

            <a
              href="#workflow"
              className="hover:text-[#0F4C3A]"
            >
              How it works
            </a>

            <a
              href="#guide"
              className="hover:text-[#0F4C3A]"
            >
              Guide
            </a>

            <Link
              href="/login"
              className="hover:text-[#0F4C3A]"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="font-medium text-[#0F4C3A]"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   HERO CHECK
========================================================= */

function HeroCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-[#64736C]">
      <CheckCircle2
        size={14}
        className="text-[#2C7258]"
      />

      {children}
    </div>
  );
}

/* =========================================================
   MOCK NAV
========================================================= */

function MockNav({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`mb-1 rounded-md px-2.5 py-2 text-[9px] font-medium ${
        active
          ? "bg-[#E8F0EB] text-[#0F4C3A]"
          : "text-[#88928D]"
      }`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   MOCK METRIC
========================================================= */

function MockMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8EAE7] bg-white p-3">
      <div className="text-lg font-semibold tracking-[-0.04em] text-[#20342B]">
        {value}
      </div>

      <div className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.06em] text-[#939B97]">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   MOCK NODE
========================================================= */

function MockNode({
  label,
  className,
  strong = false,
}: {
  label: string;
  className: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`absolute z-10 rounded-lg border px-3 py-2 text-[8px] font-semibold shadow-sm ${className} ${
        strong
          ? "border-[#A9C1B5] bg-[#E7F1EB] text-[#0F4C3A]"
          : "border-[#E1E6E2] bg-white text-[#56635D]"
      }`}
    >
      {label}
    </div>
  );
}

/* =========================================================
   SECTION INTRO
========================================================= */

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[740px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#648074]">
        {eyebrow}
      </div>

      <h2 className="mt-4 text-[38px] font-semibold leading-[1.15] tracking-[-0.04em] text-[#183128]">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-[#6E7B74]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  feature,
}: {
  feature: Feature;
}) {
  return (
    <div className="group rounded-2xl border border-[#E2E6E2] bg-[#FCFCFA] p-6 transition hover:-translate-y-1 hover:border-[#C7D6CD] hover:shadow-[0_14px_36px_rgba(28,40,34,0.06)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A] transition group-hover:bg-[#DDEBE3]">
        {feature.icon}
      </div>

      <h3 className="mt-5 text-[16px] font-semibold text-[#2C3933]">
        {feature.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#748079]">
        {feature.description}
      </p>
    </div>
  );
}

/* =========================================================
   WORKFLOW STEP
========================================================= */

function WorkflowStepCard({
  step,
  last,
}: {
  step: WorkflowStep;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-5">
      {/* LINE */}

      {!last && (
        <div className="absolute left-[22px] top-[48px] h-[calc(100%-22px)] w-px bg-[#D8E0DA]" />
      )}

      {/* NUMBER */}

      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D7E0DA] bg-white text-[10px] font-semibold text-[#0F4C3A] shadow-sm">
        {step.number}
      </div>

      {/* CARD */}

      <div className="mb-2 flex-1 rounded-2xl border border-[#E1E5E1] bg-white p-5">
        <h3 className="text-[16px] font-semibold text-[#2D3933]">
          {step.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#75817B]">
          {step.description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PROVENANCE ITEM
========================================================= */

function ProvenanceItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
      {children}
    </span>
  );
}

/* =========================================================
   GUIDE ROW
========================================================= */

function GuideRow({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-4 px-6 py-6 sm:grid-cols-[80px_190px_1fr] sm:items-center ${
        last
          ? ""
          : "border-b border-[#E7EAE6]"
      }`}
    >
      <div className="text-[10px] font-semibold tracking-[0.1em] text-[#7C8D84]">
        {number}
      </div>

      <div className="text-sm font-semibold text-[#34423B]">
        {title}
      </div>

      <p className="text-sm leading-6 text-[#75817B]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PRINCIPLE CHIP
========================================================= */

function PrincipleChip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-[#CFDDD4] bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#52685D]">
      {children}
    </span>
  );
}