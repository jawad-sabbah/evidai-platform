"use client";

import {useState} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Check,
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  Link2,
  Mail,
  MapPin,
  Network,
  User,
  X
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

const mentions = [
  {
    id: "m1",
    file: "company_registry.pdf",
    page: 7,
    text: "John Smith was appointed director of ACME Ltd.",
  },
  {
    id: "m2",
    file: "email_332.pdf",
    page: 2,
    text: "John requested an updated payment schedule.",
  },
  {
    id: "m3",
    file: "bank_statement.pdf",
    page: 12,
    text: "Transfer reference includes John Smith.",
  },
  {
    id: "m4",
    file: "interview.pdf",
    page: 3,
    text: "John denied being directly involved with ACME.",
  },
];

const relationships = [
  {
    id: "r1",
    type: "DIRECTOR_OF",
    target: "ACME Ltd",
    confidence: 0.96,
  },
  {
    id: "r2",
    type: "CONTROLS",
    target: "Account 3281",
    confidence: 0.92,
  },
  {
    id: "r3",
    type: "EMAILED",
    target: "Sarah Miller",
    confidence: 0.89,
  },
];

const events = [
  {
    id: "e1",
    date: "Mar 12, 2026",
    title: "$100,000 transfer",
  },
  {
    id: "e2",
    date: "Mar 14, 2026",
    title: "Email communication",
  },
  {
    id: "e3",
    date: "Mar 18, 2026",
    title: "Company registry updated",
  },
];

export default function EntityDetailsPage() {
  const { caseId, entityId } = useParams<{
    caseId: string;
    entityId: string;
  }>();

  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <AppShell showTopbar={false}>
      <div className="h-full overflow-y-auto bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1380px] px-8 py-6">
          <CaseWorkspaceHeader
            caseId={caseId}
            caseNumber="INV-2026-001"
            title="Suspicious Payments Investigation"
            status="OPEN"
            showHeader={false}
          />

          <div className="mt-6">
            <Link
              href={`/cases/${caseId}/entities`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#66716B] transition hover:text-[#0F4C3A]"
            >
              <ArrowLeft size={16} />
              Back to entities
            </Link>
          </div>

          {/* ENTITY HEADER */}
          <div className="mt-5 flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0EB] text-[#0F4C3A]">
                <User size={25} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
                    John Smith
                  </h1>

                  <span className="rounded-full bg-[#E7F2EC] px-3 py-1 text-[11px] font-semibold text-[#19704F]">
                    CONFIRMED
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#7A8580]">
                  Person
                </p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg border border-[#DEE1DC] bg-white px-4 py-2 text-sm font-medium text-[#36413C] transition hover:bg-[#F2F3EF]"
              onClick={() => setReviewOpen(true)}
            >
              Review entity
            </button>
          </div>

          {/* TOP GRID */}
          <div className="mt-6 grid grid-cols-[1.1fr_0.9fr] gap-5">
            {/* BASIC INFO */}
            <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
              <h2 className="text-sm font-semibold text-[#26312C]">
                Entity Information
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-5">
                <InfoItem label="Type" value="Person" />
                <InfoItem label="Confidence" value="98%" />
                <InfoItem label="Review Status" value="Confirmed" />
                <InfoItem label="Mentions" value="21" />
                <InfoItem label="First Seen" value="Jan 12, 2026" />
                <InfoItem label="Last Seen" value="Mar 14, 2026" />
              </div>

              <div className="mt-6 border-t border-[#ECEDE9] pt-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#929A96]">
                  Description
                </div>

                <p className="mt-2 text-sm leading-6 text-[#68736E]">
                  Director associated with ACME Ltd and referenced across
                  corporate registry records, financial documents, email
                  correspondence, and interview material.
                </p>
              </div>
            </section>

            {/* SUMMARY */}
            <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
              <h2 className="text-sm font-semibold text-[#26312C]">
                Investigation Summary
              </h2>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniMetric
                  icon={<FileText size={17} />}
                  value="21"
                  label="Mentions"
                />

                <MiniMetric
                  icon={<Network size={17} />}
                  value="8"
                  label="Relationships"
                />

                <MiniMetric
                  icon={<CalendarDays size={17} />}
                  value="14"
                  label="Events"
                />
              </div>

              <div className="mt-6 rounded-lg bg-[#F5F7F4] p-4">
                <p className="text-sm leading-6 text-[#65716B]">
                  John Smith appears across several evidence sources and is
                  linked to ACME Ltd, Account 3281, and Sarah Miller.
                </p>
              </div>
            </section>
          </div>

          {/* RELATIONSHIPS + EVENTS */}
          <div className="mt-5 grid grid-cols-2 gap-5">
            {/* RELATIONSHIPS */}
            <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#26312C]">
                  Relationships
                </h2>

                <Link
                  href={`/cases/${caseId}/graph`}
                  className="text-xs font-medium text-[#0F4C3A]"
                >
                  View graph
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#ECEDE9]">
                {relationships.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
                        <Link2 size={15} />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-[#35413B]">
                          {formatLabel(relationship.type)}
                        </div>

                        <div className="mt-0.5 text-xs text-[#8D9691]">
                          {relationship.target}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-[#71807A]">
                      {Math.round(relationship.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* EVENTS */}
            <section className="rounded-xl border border-[#E4E6E2] bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#26312C]">
                  Related Events
                </h2>

                <Link
                  href={`/cases/${caseId}/timeline`}
                  className="text-xs font-medium text-[#0F4C3A]"
                >
                  View timeline
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#ECEDE9]">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 py-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F0E7] text-[#9A731E]">
                      <CalendarDays size={15} />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-[#35413B]">
                        {event.title}
                      </div>

                      <div className="mt-0.5 text-xs text-[#8D9691]">
                        {event.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* EVIDENCE MENTIONS */}
          <section className="mt-5 rounded-xl border border-[#E4E6E2] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#26312C]">
                  Evidence Mentions
                </h2>

                <p className="mt-1 text-xs text-[#8D9691]">
                  Locations where this entity appears in source evidence.
                </p>
              </div>

              <span className="text-xs font-medium text-[#71807A]">
                Entity ID: {entityId}
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[#ECEDE9]">
              <div className="grid grid-cols-[1.4fr_0.5fr_2fr] bg-[#FAFAF7] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
                <div>Evidence</div>
                <div>Page</div>
                <div>Mention</div>
              </div>

              {mentions.map((mention) => (
                <div
                  key={mention.id}
                  className="grid grid-cols-[1.4fr_0.5fr_2fr] border-t border-[#ECEDE9] px-4 py-4"
                >
                  <Link
                    href={`/cases/${caseId}/evidence/ev-001`}
                    className="flex items-center gap-2 text-sm font-medium text-[#0F4C3A]"
                  >
                    <FileText size={15} />
                    {mention.file}
                  </Link>

                  <div className="text-sm text-[#65716B]">
                    {mention.page}
                  </div>

                  <div className="text-sm text-[#65716B]">
                    {mention.text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>


      {reviewOpen && (
          <ReviewEntityModal
            entity={{
              name: "John Smith",
              type: "PERSON",
              confidence: 0.98,
              mentions: 21,
              currentStatus: "CONFIRMED",
            }}
            onClose={() => setReviewOpen(false)}
            onSave={(review) => {
              console.log("Entity review:", review);

              // Later:
              // await entityApi.review(caseId, entityId, review);

              setReviewOpen(false);
            }}
          />
        )}
    </AppShell>
  );
}


function ReviewEntityModal({
  entity,
  onClose,
  onSave,
}: {
  entity: {
    name: string;
    type: string;
    confidence: number;
    mentions: number;
    currentStatus:
      | "UNREVIEWED"
      | "CONFIRMED"
      | "REJECTED"
      | "MERGED";
  };
  onClose: () => void;
  onSave: (review: {
    decision: "CONFIRMED" | "REJECTED" | "MERGED";
    mergeEntity?: string;
    notes: string;
  }) => void;
}) {
  const [decision, setDecision] = useState<
    "CONFIRMED" | "REJECTED" | "MERGED"
  >(
    entity.currentStatus === "CONFIRMED"
      ? "CONFIRMED"
      : "CONFIRMED",
  );

  const [mergeEntity, setMergeEntity] = useState("");
  const [notes, setNotes] = useState("");

  function handleSave() {
    if (decision === "MERGED" && !mergeEntity) {
      return;
    }

    onSave({
      decision,
      mergeEntity:
        decision === "MERGED"
          ? mergeEntity
          : undefined,
      notes,
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Entity Review
            </div>

            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Review entity
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Validate this extracted entity before using it across the
              investigation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
          >
            <X size={16} />
          </button>
        </div>

        {/* ENTITY SUMMARY */}
        <div className="border-b border-[#ECEDE9] bg-[#FAFAF7] px-7 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A]">
              <User size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-[#26312C]">
                {entity.name}
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-[#818A85]">
                <span>{formatReviewLabel(entity.type)}</span>

                <span>•</span>

                <span>
                  {Math.round(entity.confidence * 100)}% confidence
                </span>

                <span>•</span>

                <span>{entity.mentions} mentions</span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 py-6">
          <div>
            <div className="text-sm font-semibold text-[#35413B]">
              Review decision
            </div>

            <p className="mt-1 text-xs text-[#89928D]">
              Choose how EvidAI should treat this entity.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <DecisionOption
                title="Confirm"
                description="Entity is correct."
                selected={decision === "CONFIRMED"}
                onClick={() =>
                  setDecision("CONFIRMED")
                }
              />

              <DecisionOption
                title="Reject"
                description="Extraction is incorrect."
                selected={decision === "REJECTED"}
                onClick={() =>
                  setDecision("REJECTED")
                }
              />

              <DecisionOption
                title="Merge"
                description="Duplicate entity."
                selected={decision === "MERGED"}
                onClick={() =>
                  setDecision("MERGED")
                }
              />
            </div>
          </div>

          {/* MERGE ENTITY */}
          {decision === "MERGED" && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#35413B]">
                Merge with
              </label>

              <select
                value={mergeEntity}
                onChange={(event) =>
                  setMergeEntity(event.target.value)
                }
                className="h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm text-[#18201D] outline-none transition focus:border-[#93AA9F]"
              >
                <option value="">
                  Select canonical entity
                </option>

                <option value="ent-005">
                  Jonathan Smith — Person
                </option>

                <option value="ent-008">
                  J. Smith — Person
                </option>
              </select>

              <p className="mt-2 text-xs leading-5 text-[#8B9490]">
                Mentions and relationships will eventually be reassigned to
                the selected canonical entity.
              </p>
            </div>
          )}

          {/* NOTES */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-[#35413B]">
              Review notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={4}
              placeholder="Optional note explaining your review decision..."
              className="w-full resize-none rounded-lg border border-[#DDE1DC] bg-white px-4 py-3 text-sm text-[#18201D] outline-none transition placeholder:text-[#A1A8A4] focus:border-[#93AA9F] focus:ring-4 focus:ring-[#0F4C3A]/5"
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <div>
                <div className="text-xs font-semibold text-[#405048]">
                  Human-reviewed intelligence
                </div>

                <p className="mt-1 text-xs leading-5 text-[#75817A]">
                  Your decision affects how this entity is used in
                  relationships, events, claims, and investigation analysis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <div className="text-xs text-[#8A938E]">
            Current status:{" "}
            <span className="font-semibold text-[#59645F]">
              {formatReviewLabel(entity.currentStatus)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                decision === "MERGED" &&
                !mergeEntity
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white transition hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={15} />
              Save review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionOption({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#8FAB9D] bg-[#F1F6F3]"
          : "border-[#E2E5E1] bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
            selected
              ? "border-[#0F4C3A] bg-[#0F4C3A]"
              : "border-[#BBC2BE]"
          }`}
        >
          {selected && (
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </div>

        <div className="text-sm font-semibold text-[#35413B]">
          {title}
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-[#85908A]">
        {description}
      </p>
    </button>
  );
}

function formatReviewLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
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

function MiniMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8EAE6] bg-[#FCFCF9] p-4">
      <div className="flex items-center gap-2 text-[#0F4C3A]">
        {icon}

        <span className="text-lg font-semibold text-[#18201D]">
          {value}
        </span>
      </div>

      <div className="mt-2 text-xs text-[#7A8580]">
        {label}
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


