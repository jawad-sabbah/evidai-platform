"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

const steps = [
  {
    id: 1,
    title: "Case Details",
    description: "Basic information",
  },
  {
    id: 2,
    title: "Add Team",
    description: "Collaborators",
  },
  {
    id: 3,
    title: "Initial Evidence",
    description: "Upload files",
  },
  {
    id: 4,
    title: "Review & Create",
    description: "Confirm details",
  },
];

type CaseForm = {
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  priority: string;
};

export default function NewCasePage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState<CaseForm>({
    caseNumber: "INV-2026-006",
    title: "",
    description: "",
    caseType: "",
    priority: "MEDIUM",
  });

  function generateCaseNumber() {
    const random = Math.floor(100 + Math.random() * 900);

    setForm((current) => ({
      ...current,
      caseNumber: `INV-2026-${random}`,
    }));
  }

  function nextStep() {
    if (currentStep < steps.length) {
      setCurrentStep((step) => step + 1);
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    }
  }

  return (
    <AppShell showTopbar={false}>
      {/* Entire create-case page stays inside the viewport */}
      <div className="h-[calc(100vh-68px)] overflow-hidden bg-[#F7F7F3] px-8 py-5">
        <div className="mx-auto flex h-full max-w-[1320px] flex-col">
          {/* PAGE HEADER */}
          <div className="shrink-0">
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#53605A] transition hover:text-[#0F4C3A]"
            >
              <ArrowLeft size={17} />
              Back to cases
            </Link>

            <div className="mt-3">
              <h1 className="text-[34px] font-semibold tracking-[-0.035em] text-[#18201D]">
                Create case
              </h1>

              <p className="mt-1 text-sm text-[#69736F]">
                Set up a new investigation workspace.
              </p>
            </div>
          </div>

          {/* MAIN CREATE CASE CARD */}
          <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-xl border border-[#E3E5E0] bg-white shadow-[0_12px_35px_rgba(27,38,32,0.05)]">
            <div className="grid h-full grid-cols-[290px_minmax(0,1fr)]">
              {/* LEFT STEPPER PANEL */}
              <aside className="relative h-full overflow-hidden border-r border-[#E5E7E2] bg-[#F1F1EC]">
                {/* Optional background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('/case-create-bg.jpg')",
                  }}
                />

                {/* Light overlay on top of image */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#F4F4EF]/95 via-[#F4F4EF]/82 to-[#203029]/38" />

                <div className="relative z-10 flex h-full flex-col px-8 py-8">
                  {/* STEPS */}
                  <div className="relative">
                    <div className="absolute left-[18px] top-[18px] bottom-[18px] w-px bg-[#B8C0BB]" />

                    <div className="space-y-7">
                      {steps.map((step) => {
                        const active = currentStep === step.id;
                        const completed = currentStep > step.id;

                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => setCurrentStep(step.id)}
                            className="relative flex w-full items-start gap-4 text-left"
                          >
                            <div
                              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                                active || completed
                                  ? "bg-[#0F4C3A] text-white"
                                  : "bg-[#BCC1BE] text-white"
                              }`}
                            >
                              {completed ? (
                                <Check size={15} />
                              ) : (
                                step.id
                              )}
                            </div>

                            <div className="pt-0.5">
                              <div
                                className={`text-[15px] font-semibold ${
                                  active
                                    ? "text-[#0F4C3A]"
                                    : "text-[#29332F]"
                                }`}
                              >
                                {step.title}
                              </div>

                              <div className="mt-0.5 text-[13px] text-[#6F7974]">
                                {step.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUOTE */}
                  <div className="mt-auto pb-4">
                    <p className="max-w-[210px] text-[24px] font-medium leading-[1.2] tracking-[-0.025em] text-white drop-shadow">
                      Every case
                      <br />
                      starts with a question.
                    </p>

                    <div className="mt-4 h-[2px] w-10 bg-[#2B8067]" />
                  </div>
                </div>
              </aside>

              {/* RIGHT SIDE */}
              <section className="flex min-h-0 flex-col bg-white">
                {/* FORM CONTENT
                    Only this part scrolls if screen is too short */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="mx-auto w-full max-w-[790px] px-10 py-7">
                    {currentStep === 1 && (
                      <CaseDetailsStep
                        form={form}
                        setForm={setForm}
                        onGenerate={generateCaseNumber}
                      />
                    )}

                    {currentStep === 2 && <TeamStep />}

                    {currentStep === 3 && <EvidenceStep />}

                    {currentStep === 4 && (
                      <ReviewStep form={form} />
                    )}
                  </div>
                </div>

                {/* PINNED BOTTOM ACTIONS */}
                <div className="shrink-0 border-t border-[#ECEDE9] bg-white">
                  <div className="mx-auto flex max-w-[790px] items-center justify-end gap-3 px-10 py-4">
                    {currentStep === 1 ? (
                      <Link
                        href="/cases"
                        className="inline-flex h-10 min-w-[118px] items-center justify-center rounded-lg border border-[#DEE1DC] bg-[#F3F4F0] px-5 text-sm font-medium text-[#35413B] transition hover:bg-[#EBEDE8]"
                      >
                        Cancel
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={previousStep}
                        className="inline-flex h-10 min-w-[118px] items-center justify-center rounded-lg border border-[#DEE1DC] bg-[#F3F4F0] px-5 text-sm font-medium text-[#35413B] transition hover:bg-[#EBEDE8]"
                      >
                        Back
                      </button>
                    )}

                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white transition hover:bg-[#0A382B]"
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex h-10 min-w-[165px] items-center justify-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white transition hover:bg-[#0A382B]"
                      >
                        <Check size={16} />
                        Create case
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   STEP 1 — CASE DETAILS
========================================================= */

function CaseDetailsStep({
  form,
  setForm,
  onGenerate,
}: {
  form: CaseForm;
  setForm: React.Dispatch<React.SetStateAction<CaseForm>>;
  onGenerate: () => void;
}) {
  const inputClass =
    "h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm text-[#18201D] outline-none transition placeholder:text-[#A1A8A4] focus:border-[#93AA9F] focus:ring-4 focus:ring-[#0F4C3A]/5";

  return (
    <div className="w-full">
      <div>
        <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
          Case Details
        </h2>

        <p className="mt-1 text-sm text-[#69736F]">
          Let&apos;s start with the basic information.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {/* CASE NUMBER */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#26312C]">
            Case Number
          </label>

          <div className="flex gap-3">
            <input
              value={form.caseNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  caseNumber: event.target.value,
                }))
              }
              className={inputClass}
            />

            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-[#DEE2DD] bg-[#F1F3EF] px-5 text-sm font-medium text-[#234A3D] transition hover:bg-[#E8ECE7]"
            >
              <RefreshCw size={15} />
              Generate
            </button>
          </div>
        </div>

        {/* TITLE */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#26312C]">
            Title
          </label>

          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="e.g. New Investigation"
            className={inputClass}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#26312C]">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
            placeholder="Provide a brief description of the investigation..."
            className="min-h-[80px] w-full resize-none rounded-lg border border-[#DDE1DC] bg-white px-4 py-3 text-sm text-[#18201D] outline-none transition placeholder:text-[#A1A8A4] focus:border-[#93AA9F] focus:ring-4 focus:ring-[#0F4C3A]/5"
          />
        </div>

        {/* CASE TYPE + PRIORITY */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#26312C]">
              Case Type
            </label>

            <select
              value={form.caseType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  caseType: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">Select case type</option>
              <option value="FINANCIAL_CRIME">
                Financial Crime
              </option>
              <option value="FRAUD">
                Fraud Investigation
              </option>
              <option value="COMPLIANCE">
                Compliance Review
              </option>
              <option value="INTERNAL_REVIEW">
                Internal Review
              </option>
              <option value="CYBER">
                Cyber Investigation
              </option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#26312C]">
              Priority
            </label>

            <select
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STEP 2 — TEAM
========================================================= */

function TeamStep() {
  return (
    <div className="w-full">
      <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
        Add Team
      </h2>

      <p className="mt-1 text-sm text-[#69736F]">
        Assign collaborators to this investigation.
      </p>

      <div className="mt-7 rounded-xl border border-dashed border-[#CDD4CE] bg-[#FAFAF7] px-8 py-12 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFEA] text-[#0F4C3A]">
          <Users size={20} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-[#36413C]">
          No team members added yet
        </h3>

        <p className="mt-1 text-sm text-[#87908B]">
          Add investigators, reviewers, owners, or viewers.
        </p>

        <button
          type="button"
          className="mt-5 rounded-lg bg-[#0F4C3A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A382B]"
        >
          + Add team member
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   STEP 3 — EVIDENCE
========================================================= */

function EvidenceStep() {
  return (
    <div className="w-full">
      <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
        Initial Evidence
      </h2>

      <p className="mt-1 text-sm text-[#69736F]">
        Upload files to start building the investigation.
      </p>

      <div className="mt-7 rounded-xl border border-dashed border-[#CDD4CE] bg-[#FAFAF7] px-8 py-12 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFEA] text-[#0F4C3A]">
          <Upload size={20} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-[#36413C]">
          Drop evidence files here
        </h3>

        <p className="mt-1 text-sm text-[#87908B]">
          PDF, DOCX, CSV, XLSX, images and supported file types.
        </p>

        <button
          type="button"
          className="mt-5 rounded-lg bg-[#0F4C3A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A382B]"
        >
          Browse files
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   STEP 4 — REVIEW
========================================================= */

function ReviewStep({
  form,
}: {
  form: CaseForm;
}) {
  return (
    <div className="w-full">
      <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
        Review & Create
      </h2>

      <p className="mt-1 text-sm text-[#69736F]">
        Confirm the case information before creating it.
      </p>

      <div className="mt-7 overflow-hidden rounded-xl border border-[#E4E6E2]">
        <ReviewRow
          label="Case Number"
          value={form.caseNumber || "—"}
        />

        <ReviewRow
          label="Title"
          value={form.title || "Not provided"}
        />

        <ReviewRow
          label="Case Type"
          value={
            form.caseType
              ? form.caseType.replaceAll("_", " ")
              : "Not selected"
          }
        />

        <ReviewRow
          label="Priority"
          value={form.priority}
        />

        <ReviewRow
          label="Description"
          value={
            form.description ||
            "No description provided"
          }
          last
        />
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[150px_1fr] gap-5 px-5 py-3.5 ${
        last ? "" : "border-b border-[#ECEDE9]"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
        {label}
      </span>

      <span className="text-sm text-[#36413C]">
        {value}
      </span>
    </div>
  );
}