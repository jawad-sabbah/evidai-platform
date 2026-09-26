"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { SummaryCard } from "@/components/ui/summary-card";
import {DecisionCard} from "@/components/ui/decision-card";

import {formatLabel} from "@/lib/formatters";

import {
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Mail,
  MapPin,
  MoreHorizontal,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type ReviewStatus =
  | "UNREVIEWED"
  | "CONFIRMED"
  | "REJECTED"
  | "MERGED";

type EntityType =
  | "PERSON"
  | "ORGANIZATION"
  | "BANK_ACCOUNT"
  | "LOCATION"
  | "EMAIL";

type EntityItem = {
  id: string;

  entityType: EntityType;

  canonicalName: string;

  normalizedValue?: string;

  confidence: number;

  reviewStatus: ReviewStatus;

  mentions: number;

  lastSeen: string;

  reviewNotes?: string;

  mergedInto?: string;
};

/* =========================================================
   MOCK DATA
   Immediately after processing -> UNREVIEWED
========================================================= */

const initialEntities: EntityItem[] = [
  {
    id: "ent-001",
    entityType: "PERSON",
    canonicalName: "John Smith",
    confidence: 0.98,
    reviewStatus: "UNREVIEWED",
    mentions: 21,
    lastSeen: "2h ago",
  },

  {
    id: "ent-002",
    entityType: "ORGANIZATION",
    canonicalName: "ACME Ltd",
    confidence: 0.96,
    reviewStatus: "UNREVIEWED",
    mentions: 16,
    lastSeen: "4h ago",
  },

  {
    id: "ent-003",
    entityType: "BANK_ACCOUNT",
    canonicalName: "Account 3281",
    normalizedValue: "LB2300013281",
    confidence: 0.99,
    reviewStatus: "UNREVIEWED",
    mentions: 8,
    lastSeen: "1d ago",
  },

  {
    id: "ent-004",
    entityType: "LOCATION",
    canonicalName: "London",
    confidence: 0.91,
    reviewStatus: "MERGED",
    mentions: 4,
    lastSeen: "1d ago",
  },

  {
    id: "ent-005",
    entityType: "PERSON",
    canonicalName: "Sarah Miller",
    confidence: 0.94,
    reviewStatus: "CONFIRMED",
    mentions: 12,
    lastSeen: "2d ago",
  },

  {
    id: "ent-006",
    entityType: "ORGANIZATION",
    canonicalName: "Global Holdings",
    confidence: 0.89,
    reviewStatus: "REJECTED",
    mentions: 6,
    lastSeen: "2d ago",
  },

  {
    id: "ent-007",
    entityType: "EMAIL",
    canonicalName: "john.smith@acme.com",
    confidence: 0.97,
    reviewStatus: "CONFIRMED",
    mentions: 9,
    lastSeen: "3d ago",
  },
];

const entityTypes: Array<"ALL" | EntityType> = [
  "ALL",
  "PERSON",
  "ORGANIZATION",
  "BANK_ACCOUNT",
  "LOCATION",
  "EMAIL",
];

const reviewStatuses: Array<
  "ALL" | ReviewStatus
> = [
  "ALL",
  "UNREVIEWED",
  "CONFIRMED",
  "REJECTED",
  "MERGED",
];

/* =========================================================
   PAGE
========================================================= */

export default function EntitiesPage() {
  const { caseId } = useParams<{
    caseId: string;
  }>();

  const [entities, setEntities] =
    useState<EntityItem[]>(initialEntities);

  const [query, setQuery] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<"ALL" | EntityType>("ALL");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ReviewStatus>("ALL");

  const [typeOpen, setTypeOpen] =
    useState(false);

  const [statusOpen, setStatusOpen] =
    useState(false);

  const [reviewEntity, setReviewEntity] =
    useState<EntityItem | null>(null);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const searchValue =
        query.toLowerCase();

      const matchesSearch =
        entity.canonicalName
          .toLowerCase()
          .includes(searchValue) ||
        entity.normalizedValue
          ?.toLowerCase()
          .includes(searchValue);

      const matchesType =
        typeFilter === "ALL" ||
        entity.entityType === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        entity.reviewStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    entities,
    query,
    typeFilter,
    statusFilter,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const confirmedCount = entities.filter(
    (entity) =>
      entity.reviewStatus === "CONFIRMED",
  ).length;

  const unreviewedCount = entities.filter(
    (entity) =>
      entity.reviewStatus === "UNREVIEWED",
  ).length;

  const rejectedCount = entities.filter(
    (entity) =>
      entity.reviewStatus === "REJECTED",
  ).length;

  const uniqueTypes = new Set(
    entities.map(
      (entity) => entity.entityType,
    ),
  ).size;

  /* =========================================================
     REVIEW ACTION
  ========================================================= */

  function handleReviewSave(data: {
    entityId: string;
    decision: Exclude<
      ReviewStatus,
      "UNREVIEWED"
    >;
    notes: string;
    mergeEntityId?: string;
  }) {
    setEntities((current) =>
      current.map((entity) => {
        if (
          entity.id !== data.entityId
        ) {
          return entity;
        }

        const mergeTarget =
          entities.find(
            (item) =>
              item.id ===
              data.mergeEntityId,
          );

        return {
          ...entity,

          reviewStatus: data.decision,

          reviewNotes: data.notes,

          mergedInto:
            data.decision === "MERGED"
              ? mergeTarget
                  ?.canonicalName
              : undefined,
        };
      }),
    );

    setReviewEntity(null);

    /*
      Later backend:

      PATCH /cases/{caseId}/entities/{entityId}/review

      {
        decision: "CONFIRMED",
        notes: "Verified against registry"
      }
    */
  }

  return (
    <AppShell showTopbar={false}>
      <div className="h-full overflow-y-auto bg-[#F7F7F3]">
        <div className="mx-auto max-w-[1380px] px-8 py-6">
          {/* =================================================
              CASE HEADER
          ================================================= */}

          <CaseWorkspaceHeader
            caseId={caseId}
            caseNumber="INV-2026-001"
            title="Suspicious Payments Investigation"
            status="OPEN"
          />

          {/* =================================================
              PAGE TITLE
          ================================================= */}

          <div className="mt-7">
            <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Entities
            </h2>

            <p className="mt-1 text-sm text-[#7A8580]">
              Review people,
              organizations, accounts,
              locations, and other entities
              extracted from case evidence.
            </p>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="mt-6 grid grid-cols-4 gap-4">
            <SummaryCard
              label="Total Entities"
              value={entities.length.toString()}
            />

            <SummaryCard
              label="Confirmed"
              value={confirmedCount.toString()}
              tone="success"
            />

            <SummaryCard
              label="Unreviewed"
              value={unreviewedCount.toString()}
              tone="warning"
            />

            <SummaryCard
              label="Entity Types"
              value={uniqueTypes.toString()}
            />
          </div>

          {/* =================================================
              REVIEW QUEUE BANNER
          ================================================= */}

          {unreviewedCount > 0 && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-[#E8E2CF] bg-[#FBF8EF] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3ECD5] text-[#98752D]">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#67572D]">
                    {unreviewedCount}{" "}
                    {unreviewedCount === 1
                      ? "entity is"
                      : "entities are"}{" "}
                    awaiting review
                  </div>

                  <p className="mt-1 text-xs text-[#8B7B4B]">
                    These entities were
                    extracted automatically
                    from processed evidence and
                    have not yet been confirmed
                    by an investigator.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter(
                    "UNREVIEWED",
                  );
                }}
                className="shrink-0 rounded-lg bg-[#0F4C3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0A382B]"
              >
                Review entities
              </button>
            </div>
          )}

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="relative z-[50] mt-6 flex flex-wrap items-center gap-3 overflow-visible">
            {/* SEARCH */}

            <div className="relative w-full max-w-[430px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#919A95]"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                placeholder="Search entities..."
                className="h-10 w-full rounded-lg border border-[#E0E3DE] bg-white pl-10 pr-4 text-sm text-[#18201D] outline-none transition placeholder:text-[#9DA5A1] focus:border-[#98ADA2]"
              />
            </div>

            {/* TYPE FILTER */}

            <FilterDropdown
              label={
                typeFilter === "ALL"
                  ? "All types"
                  : formatLabel(
                      typeFilter,
                    )
              }
              open={typeOpen}
              setOpen={setTypeOpen}
              options={entityTypes}
              selected={typeFilter}
              onSelect={(value) => {
                setTypeFilter(
                  value as
                    | "ALL"
                    | EntityType,
                );

                setTypeOpen(false);
              }}
              formatter={(value) =>
                value === "ALL"
                  ? "All types"
                  : formatLabel(value)
              }
            />

            {/* STATUS FILTER */}

            <FilterDropdown
              label={
                statusFilter === "ALL"
                  ? "All statuses"
                  : formatLabel(
                      statusFilter,
                    )
              }
              open={statusOpen}
              setOpen={setStatusOpen}
              options={reviewStatuses}
              selected={statusFilter}
              onSelect={(value) => {
                setStatusFilter(
                  value as
                    | "ALL"
                    | ReviewStatus,
                );

                setStatusOpen(false);
              }}
              formatter={(value) =>
                value === "ALL"
                  ? "All statuses"
                  : formatLabel(value)
              }
            />
          </div>

          {/* =================================================
              ENTITY TABLE
          ================================================= */}

          <div className="relative z-0 mt-5 overflow-hidden rounded-xl border border-[#E3E5E1] bg-white">
            {/* HEADER */}

            <div className="grid grid-cols-[minmax(280px,2fr)_1fr_0.7fr_1fr_0.9fr_120px_42px] border-b border-[#E7E9E5] bg-[#FAFAF7] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
              <div>Entity</div>

              <div>Type</div>

              <div>Mentions</div>

              <div>Confidence</div>

              <div>Status</div>

              <div>Action</div>

              <div />
            </div>

            {/* ROWS */}

            {filteredEntities.length > 0 ? (
              filteredEntities.map(
                (entity) => (
                  <EntityRow
                    key={entity.id}
                    entity={entity}
                    caseId={caseId}
                    onReview={() =>
                      setReviewEntity(
                        entity,
                      )
                    }
                  />
                ),
              )
            ) : (
              <div className="px-6 py-14 text-center">
                <Search
                  size={26}
                  className="mx-auto text-[#A4ACA8]"
                />

                <div className="mt-3 text-sm font-medium text-[#44504A]">
                  No entities found
                </div>

                <p className="mt-1 text-xs text-[#8D9691]">
                  Try changing your search
                  or filters.
                </p>
              </div>
            )}
          </div>

          {/* REJECTED INFORMATION */}

          {rejectedCount > 0 && (
            <p className="mt-3 text-xs text-[#8B9490]">
              Rejected entities remain
              available for audit history but
              should not be treated as
              validated case intelligence.
            </p>
          )}
        </div>

        {/* ===================================================
            REVIEW MODAL
        =================================================== */}

        {reviewEntity && (
          <ReviewEntityModal
            entity={reviewEntity}
            entities={entities}
            onClose={() =>
              setReviewEntity(null)
            }
            onSave={handleReviewSave}
          />
        )}
      </div>
    </AppShell>
  );
}

/* =========================================================
   ENTITY ROW
========================================================= */

function EntityRow({
  entity,
  caseId,
  onReview,
}: {
  entity: EntityItem;
  caseId: string;
  onReview: () => void;
}) {
  const rejected =
    entity.reviewStatus === "REJECTED";

  return (
    <div
      className={`grid grid-cols-[minmax(280px,2fr)_1fr_0.7fr_1fr_0.9fr_120px_42px] items-center border-b border-[#ECEDE9] px-5 py-4 last:border-b-0 transition ${
        rejected
          ? "bg-[#FCFAF9] opacity-70"
          : "bg-white hover:bg-[#FCFCF9]"
      }`}
    >
      {/* ENTITY */}

      <Link
        href={`/cases/${caseId}/entities/${entity.id}`}
        className="flex min-w-0 items-center gap-3"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            entity.reviewStatus ===
            "REJECTED"
              ? "bg-[#F4ECEA] text-[#A2675F]"
              : "bg-[#EEF3F0] text-[#0F4C3A]"
          }`}
        >
          <EntityIcon
            type={entity.entityType}
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#25302B] transition hover:text-[#0F4C3A]">
            {entity.canonicalName}
          </div>

          {entity.normalizedValue && (
            <div className="mt-0.5 truncate text-xs text-[#929A96]">
              {
                entity.normalizedValue
              }
            </div>
          )}

          <div className="mt-0.5 text-xs text-[#A0A7A3]">
            Last seen{" "}
            {entity.lastSeen}
          </div>

          {entity.reviewStatus ===
            "MERGED" &&
            entity.mergedInto && (
              <div className="mt-1 text-[10px] font-medium text-[#586B7A]">
                Merged into{" "}
                {entity.mergedInto}
              </div>
            )}
        </div>
      </Link>

      {/* TYPE */}

      <div className="text-sm text-[#66716B]">
        {formatLabel(
          entity.entityType,
        )}
      </div>

      {/* MENTIONS */}

      <div className="text-sm font-medium text-[#4B5651]">
        {entity.mentions}
      </div>

      {/* CONFIDENCE */}

      <ConfidenceValue
        value={entity.confidence}
      />

      {/* STATUS */}

      <ReviewStatusBadge
        status={entity.reviewStatus}
      />

      {/* ACTION */}

       <div>
        {entity.reviewStatus === "UNREVIEWED" ? (
          <button
            type="button"
            onClick={onReview}
            className="inline-flex h-8 min-w-[82px] items-center justify-center whitespace-nowrap rounded-lg border border-[#D9DED9] bg-white px-3 text-xs font-semibold text-[#0F4C3A] transition hover:border-[#AABCB2] hover:bg-[#F2F6F3]"
          >
            Review
          </button>
        ) : entity.reviewStatus === "CONFIRMED" ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#19704F]">
            <Check size={14} />
            Reviewed
          </div>
        ) : entity.reviewStatus === "REJECTED" ? (
          <span className="text-xs font-medium text-[#B64D42]">
            Rejected
          </span>
        ) : (
          <span className="text-xs font-medium text-[#586B7A]">
            Merged
          </span>
        )}
      </div>

      
    </div>
  );
}

/* =========================================================
   CONFIDENCE
========================================================= */

function ConfidenceValue({
  value,
}: {
  value: number;
}) {
  const percent =
    Math.round(value * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[34px] text-sm font-medium text-[#4A5650]">
        {percent}%
      </span>

      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E9ECE8]">
        <div
          className="h-full rounded-full bg-[#4C8B73]"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function ReviewStatusBadge({
  status,
}: {
  status: ReviewStatus;
}) {
  const styles: Record<
    ReviewStatus,
    string
  > = {
    UNREVIEWED:
      "bg-[#F4F0E4] text-[#98752D]",

    CONFIRMED:
      "bg-[#E7F2EC] text-[#19704F]",

    REJECTED:
      "bg-[#F7E9E7] text-[#B64D42]",

    MERGED:
      "bg-[#E9EDF1] text-[#586B7A]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.04em] ${styles[status]}`}
    >
      {formatLabel(status)}
    </span>
  );
}

/* =========================================================
   ICON
========================================================= */

function EntityIcon({
  type,
}: {
  type: EntityType;
}) {
  switch (type) {
    case "PERSON":
      return <User size={17} />;

    case "ORGANIZATION":
      return (
        <Building2 size={17} />
      );

    case "BANK_ACCOUNT":
      return (
        <CreditCard size={17} />
      );

    case "LOCATION":
      return <MapPin size={17} />;

    case "EMAIL":
      return <Mail size={17} />;

    default:
      return <User size={17} />;
  }
}
/* =========================================================
   FILTER DROPDOWN
========================================================= */

function FilterDropdown({
  label,
  open,
  setOpen,
  options,
  selected,
  onSelect,
  formatter,
}: {
  label: string;

  open: boolean;

  setOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  options: string[];

  selected: string;

  onSelect: (
    value: string,
  ) => void;

  formatter: (
    value: string,
  ) => string;
}) {
  return (
    <div className="relative z-[60]">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className="flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-lg border border-[#E0E3DE] bg-white px-4 text-sm text-[#59635F] transition hover:bg-[#F5F6F2]"
      >
        {label}

        <ChevronDown
          size={15}
          className={`transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[999] min-w-[190px] overflow-hidden rounded-xl border border-[#E2E4DF] bg-white p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
          {options.map((option) => {
            const isSelected =
              selected === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onSelect(option)
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-[#EEF3F0] font-medium text-[#0F4C3A]"
                    : "text-[#59635F] hover:bg-[#F3F5F1] hover:text-[#18201D]"
                }`}
              >
                {formatter(option)}

                {isSelected && (
                  <Check size={14} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewEntityModal({
  entity,
  entities,
  onClose,
  onSave,
}: {
  entity: EntityItem;

  entities: EntityItem[];

  onClose: () => void;

  onSave: (data: {
    entityId: string;

    decision: Exclude<
      ReviewStatus,
      "UNREVIEWED"
    >;

    notes: string;

    mergeEntityId?: string;
  }) => void;
}) {
  const initialDecision:
    | "CONFIRMED"
    | "REJECTED"
    | "MERGED" =
    entity.reviewStatus ===
      "CONFIRMED" ||
    entity.reviewStatus ===
      "REJECTED" ||
    entity.reviewStatus === "MERGED"
      ? entity.reviewStatus
      : "CONFIRMED";

  const [decision, setDecision] =
    useState<
      | "CONFIRMED"
      | "REJECTED"
      | "MERGED"
    >(initialDecision);

  const [notes, setNotes] =
    useState(
      entity.reviewNotes || "",
    );

  const [mergeEntityId, setMergeEntityId] =
    useState("");

  const possibleMergeTargets =
    entities.filter(
      (item) =>
        item.id !== entity.id &&
        item.entityType ===
          entity.entityType &&
        item.reviewStatus !==
          "REJECTED" &&
        item.reviewStatus !==
          "MERGED",
    );

  const canSave =
    decision !== "MERGED" ||
    Boolean(mergeEntityId);

  function handleSave() {
    if (!canSave) return;

    onSave({
      entityId: entity.id,
      decision,
      notes,

      mergeEntityId:
        decision === "MERGED"
          ? mergeEntityId
          : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[650px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
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
              Validate the extracted entity
              before treating it as reviewed
              investigation intelligence.
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

        {/* ENTITY */}

        <div className="border-b border-[#ECEDE9] bg-[#FAFAF7] px-7 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F0EB] text-[#0F4C3A]">
              <EntityIcon
                type={entity.entityType}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-[#26312C]">
                {entity.canonicalName}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#818A85]">
                <span>
                  {formatLabel(
                    entity.entityType,
                  )}
                </span>

                <span>•</span>

                <span>
                  {Math.round(
                    entity.confidence *
                      100,
                  )}
                  % confidence
                </span>

                <span>•</span>

                <span>
                  {entity.mentions} mentions
                </span>
              </div>
            </div>

            <ReviewStatusBadge
              status={
                entity.reviewStatus
              }
            />
          </div>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          <div>
            <div className="text-sm font-semibold text-[#35413B]">
              Review decision
            </div>

            <p className="mt-1 text-xs text-[#89928D]">
              Choose how this entity
              should be handled.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <DecisionCard
                title="Confirm"
                description="Extraction is correct."
                selected={
                  decision ===
                  "CONFIRMED"
                }
                onClick={() =>
                  setDecision(
                    "CONFIRMED",
                  )
                }
              />

              <DecisionCard
                title="Reject"
                description="Extraction is incorrect."
                selected={
                  decision ===
                  "REJECTED"
                }
                onClick={() =>
                  setDecision(
                    "REJECTED",
                  )
                }
              />

              <DecisionCard
                title="Merge"
                description="Duplicate of another entity."
                selected={
                  decision === "MERGED"
                }
                onClick={() =>
                  setDecision("MERGED")
                }
              />
            </div>
          </div>

          {/* MERGE */}

          {decision === "MERGED" && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#35413B]">
                Merge into
              </label>

              <select
                value={mergeEntityId}
                onChange={(event) =>
                  setMergeEntityId(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm text-[#18201D] outline-none transition focus:border-[#93AA9F]"
              >
                <option value="">
                  Select canonical entity
                </option>

                {possibleMergeTargets.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {
                        item.canonicalName
                      }{" "}
                      —{" "}
                      {formatLabel(
                        item.entityType,
                      )}
                    </option>
                  ),
                )}
              </select>

              <p className="mt-2 text-xs leading-5 text-[#8B9490]">
                A backend merge should later
                move mentions and references
                to the canonical entity.
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
                setNotes(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Optional note explaining the review decision..."
              className="w-full resize-none rounded-lg border border-[#DDE1DC] bg-white px-4 py-3 text-sm text-[#18201D] outline-none transition placeholder:text-[#A1A8A4] focus:border-[#93AA9F] focus:ring-4 focus:ring-[#0F4C3A]/5"
            />
          </div>

          {/* INFO */}

          <div className="mt-6 rounded-xl border border-[#E4E9E4] bg-[#F6F8F5] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#0F4C3A]"
              />

              <div>
                <div className="text-xs font-semibold text-[#405048]">
                  Human review
                </div>

                <p className="mt-1 text-xs leading-5 text-[#75817A]">
                  Confidence reflects the
                  extraction model. Confirmation
                  reflects an investigators
                  review decision.
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
              {formatLabel(
                entity.reviewStatus,
              )}
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
              disabled={!canSave}
              onClick={handleSave}
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
