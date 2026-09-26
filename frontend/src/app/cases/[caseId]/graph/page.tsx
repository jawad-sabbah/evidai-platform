"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

import {formatLabel} from "@/lib/formatters";
import { EntityIcon } from "@/components/entities/entity-icon";

import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  Building2,
  CreditCard,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  Network,
  Search,
  User,
  X,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { CaseWorkspaceHeader } from "@/components/cases/case-workspace-header";

/* =========================================================
   TYPES
========================================================= */

type EntityType =
  | "PERSON"
  | "ORGANIZATION"
  | "BANK_ACCOUNT"
  | "EMAIL";

type GraphEntity = {
  id: string;
  name: string;
  type: EntityType;
  confidence: number;
};

type RelationshipEvidence = {
  id: string;

  evidenceId: string;

  file: string;

  page: number;

  excerpt: string;
};

type Relationship = {
  id: string;

  source: string;

  target: string;

  type: string;

  confidence: number;

  description: string;

  evidence: RelationshipEvidence[];
};

/* =========================================================
   ENTITIES MOCK DATA
========================================================= */

const entities: GraphEntity[] = [
  {
    id: "john",
    name: "John Smith",
    type: "PERSON",
    confidence: 0.98,
  },

  {
    id: "acme",
    name: "ACME Ltd",
    type: "ORGANIZATION",
    confidence: 0.96,
  },

  {
    id: "account",
    name: "Account 3281",
    type: "BANK_ACCOUNT",
    confidence: 0.99,
  },

  {
    id: "sarah",
    name: "Sarah Miller",
    type: "PERSON",
    confidence: 0.94,
  },

  {
    id: "global",
    name: "Global Holdings",
    type: "ORGANIZATION",
    confidence: 0.89,
  },

  {
    id: "email",
    name: "john.smith@acme.com",
    type: "EMAIL",
    confidence: 0.97,
  },
];

/* =========================================================
   RELATIONSHIPS MOCK DATA

   Later:
   relationships table
        ↓
   relationship_evidence
        ↓
   evidence / page / chunk
========================================================= */

const relationships: Relationship[] = [
  {
    id: "rel-1",

    source: "john",

    target: "acme",

    type: "DIRECTOR_OF",

    confidence: 0.96,

    description:
      "John Smith is identified as a director of ACME Ltd in corporate registry evidence.",

    evidence: [
      {
        id: "re-001",

        evidenceId: "ev-004",

        file: "company_registry.pdf",

        page: 7,

        excerpt:
          "John Smith is listed as a director of ACME Ltd in the corporate registry.",
      },

      {
        id: "re-002",

        evidenceId: "ev-002",

        file: "contract_acme.pdf",

        page: 12,

        excerpt:
          "The agreement identifies John Smith as acting on behalf of ACME Ltd.",
      },

      {
        id: "re-003",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 4,

        excerpt:
          "Internal correspondence refers to John Smith as an ACME director.",
      },
    ],
  },

  {
    id: "rel-2",

    source: "john",

    target: "account",

    type: "CONTROLS",

    confidence: 0.92,

    description:
      "Evidence indicates John Smith exercises control over Account 3281.",

    evidence: [
      {
        id: "re-004",

        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 12,

        excerpt:
          "Account 3281 contains transactions authorized using credentials associated with John Smith.",
      },

      {
        id: "re-005",

        evidenceId: "ev-009",

        file: "account_opening.pdf",

        page: 3,

        excerpt:
          "John Smith is identified as an authorized account controller.",
      },

      {
        id: "re-006",

        evidenceId: "ev-011",

        file: "account_mandate.pdf",

        page: 5,

        excerpt:
          "The account mandate identifies John Smith as an authorized signatory.",
      },

      {
        id: "re-007",

        evidenceId: "ev-012",

        file: "authorization_email.pdf",

        page: 2,

        excerpt:
          "Email correspondence confirms authorization for transactions from Account 3281.",
      },
    ],
  },

  {
    id: "rel-3",

    source: "john",

    target: "sarah",

    type: "EMAILED",

    confidence: 0.89,

    description:
      "Email evidence shows direct communication between John Smith and Sarah Miller.",

    evidence: [
      {
        id: "re-008",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 2,

        excerpt:
          "Email correspondence between John Smith and Sarah Miller regarding payment scheduling.",
      },

      {
        id: "re-009",

        evidenceId: "ev-010",

        file: "mail_archive.pdf",

        page: 18,

        excerpt:
          "Additional correspondence between John Smith and Sarah Miller was identified.",
      },
    ],
  },

  {
    id: "rel-4",

    source: "acme",

    target: "global",

    type: "TRANSFERRED_TO",

    confidence: 0.93,

    description:
      "Financial evidence identifies transfers from ACME Ltd to Global Holdings.",

    evidence: [
      {
        id: "re-010",

        evidenceId: "ev-001",

        file: "bank_statement.pdf",

        page: 24,

        excerpt:
          "International transfer from ACME Ltd to Global Holdings.",
      },

      {
        id: "re-011",

        evidenceId: "ev-003",

        file: "transactions.csv",

        page: 1,

        excerpt:
          "Transaction export records Global Holdings as the receiving party.",
      },
    ],
  },

  {
    id: "rel-5",

    source: "john",

    target: "email",

    type: "USES",

    confidence: 0.98,

    description:
      "The email address is attributed to John Smith across multiple documents.",

    evidence: [
      {
        id: "re-012",

        evidenceId: "ev-004",

        file: "company_registry.pdf",

        page: 8,

        excerpt:
          "john.smith@acme.com is listed as the contact email for John Smith.",
      },

      {
        id: "re-013",

        evidenceId: "ev-008",

        file: "email_thread.pdf",

        page: 1,

        excerpt:
          "Messages were sent from john.smith@acme.com under the name John Smith.",
      },
    ],
  },
];

/* =========================================================
   GRAPH POSITIONS
========================================================= */

const positions: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  john: {
    x: 420,
    y: 230,
  },

  acme: {
    x: 420,
    y: 30,
  },

  account: {
    x: 110,
    y: 410,
  },

  sarah: {
    x: 720,
    y: 410,
  },

  global: {
    x: 720,
    y: 70,
  },

  email: {
    x: 100,
    y: 100,
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function RelationshipGraphPage() {
  const { caseId } = useParams<{
    caseId: string;
  }>();

  const [search, setSearch] =
    useState("");

  const [
    visibleTypes,
    setVisibleTypes,
  ] = useState<
    Record<EntityType, boolean>
  >({
    PERSON: true,

    ORGANIZATION: true,

    BANK_ACCOUNT: true,

    EMAIL: true,
  });

  const [
    minimumConfidence,
    setMinimumConfidence,
  ] = useState(70);

  const [
    selectedRelationship,
    setSelectedRelationship,
  ] = useState<Relationship | null>(
    relationships[0],
  );

  /* =========================================================
     FILTER ENTITIES
  ========================================================= */

  const filteredEntities =
    useMemo(() => {
      return entities.filter(
        (entity) => {
          const matchesType =
            visibleTypes[
              entity.type
            ];

          const matchesSearch =
            entity.name
              .toLowerCase()
              .includes(
                search.toLowerCase(),
              );

          return (
            matchesType &&
            matchesSearch
          );
        },
      );
    }, [
      visibleTypes,
      search,
    ]);

  const visibleEntityIds =
    useMemo(
      () =>
        new Set(
          filteredEntities.map(
            (entity) =>
              entity.id,
          ),
        ),
      [filteredEntities],
    );

  /* =========================================================
     NODES
  ========================================================= */

  const initialNodes: Node[] =
    useMemo(
      () =>
        filteredEntities.map(
          (entity) => ({
            id: entity.id,

            position:
              positions[
                entity.id
              ],

            data: {
              label: (
                <EntityNode
                  name={
                    entity.name
                  }
                  type={
                    entity.type
                  }
                  confidence={
                    entity.confidence
                  }
                />
              ),
            },

            style: {
              border:
                "none",

              background:
                "transparent",

              padding: 0,

              width: 165,
            },
          }),
        ),
      [filteredEntities],
    );

  /* =========================================================
     EDGES
  ========================================================= */

  const initialEdges: Edge[] =
    useMemo(
      () =>
        relationships
          .filter(
            (
              relationship,
            ) =>
              visibleEntityIds.has(
                relationship.source,
              ) &&
              visibleEntityIds.has(
                relationship.target,
              ) &&
              relationship.confidence *
                100 >=
                minimumConfidence,
          )

          .map(
            (
              relationship,
            ) => ({
              id: relationship.id,

              source:
                relationship.source,

              target:
                relationship.target,

              label:
                formatLabel(
                  relationship.type,
                ),

              type: "smoothstep",

              animated:
                selectedRelationship?.id ===
                relationship.id,

              style: {
                stroke:
                  selectedRelationship?.id ===
                  relationship.id
                    ? "#0F4C3A"
                    : "#A9B7B0",

                strokeWidth:
                  selectedRelationship?.id ===
                  relationship.id
                    ? 2.2
                    : 1.4,
              },

              labelStyle: {
                fill: "#5E6A64",

                fontSize: 10,

                fontWeight: 600,
              },

              labelBgStyle: {
                fill: "#F7F7F3",

                fillOpacity: 0.94,
              },

              data: {
                relationshipId:
                  relationship.id,
              },
            }),
          ),
      [
        visibleEntityIds,
        minimumConfidence,
        selectedRelationship,
      ],
    );

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] =
    useNodesState(
      initialNodes,
    );

  const [
    edges,
    setEdges,
    onEdgesChange,
  ] =
    useEdgesState(
      initialEdges,
    );

  /* =========================================================
     UPDATE GRAPH
  ========================================================= */

  useEffect(() => {
    setNodes(initialNodes);

    setEdges(initialEdges);
  }, [
    initialNodes,
    initialEdges,
    setNodes,
    setEdges,
  ]);

  /* =========================================================
     EDGE CLICK
  ========================================================= */

  function handleEdgeClick(
    _: React.MouseEvent,
    edge: Edge,
  ) {
    const relationship =
      relationships.find(
        (item) =>
          item.id === edge.id,
      );

    if (relationship) {
      setSelectedRelationship(
        relationship,
      );
    }
  }

  return (
    <AppShell showTopbar={false}>
      <div className="flex h-full flex-col overflow-hidden bg-[#F7F7F3]">
        {/* ===============================================
            CASE HEADER
        =============================================== */}

        <div className="shrink-0 px-8 pt-6">
          <div className="mx-auto max-w-[1380px]">
            <CaseWorkspaceHeader
              caseId={caseId}
              caseNumber="INV-2026-001"
              title="Suspicious Payments Investigation"
              status="OPEN"
            />
          </div>
        </div>

        {/* ===============================================
            GRAPH HEADER
        =============================================== */}

        <div className="shrink-0 px-8 py-5">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#18201D]">
                Relationship
                Graph
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Explore
                connections between
                entities detected
                across case
                evidence.
              </p>
            </div>

            <div className="text-xs text-[#86908B]">
              {entities.length}{" "}
              entities ·{" "}
              {
                relationships.length
              }{" "}
              relationships
            </div>
          </div>
        </div>

        {/* ===============================================
            MAIN GRAPH
        =============================================== */}

        <div className="min-h-0 flex-1 px-8 pb-7">
          <div className="mx-auto grid h-full max-w-[1380px] grid-cols-[230px_minmax(0,1fr)_300px] overflow-hidden rounded-xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* ===========================================
                FILTER PANEL
            =========================================== */}

            <aside className="border-r border-[#E6E8E4] bg-[#FAFAF7] p-5">
              <div className="flex items-center gap-2">
                <Filter
                  size={15}
                  className="text-[#65716B]"
                />

                <h3 className="text-sm font-semibold text-[#29342F]">
                  Filters
                </h3>
              </div>

              {/* SEARCH */}

              <div className="relative mt-5">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969E9A]"
                />

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Find entity..."
                  className="h-9 w-full rounded-lg border border-[#E0E3DE] bg-white pl-9 pr-3 text-xs outline-none placeholder:text-[#A3AAA6] focus:border-[#91A99D]"
                />
              </div>

              {/* ENTITY TYPES */}

              <div className="mt-7">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                  Entity Types
                </div>

                <div className="mt-3 space-y-2.5">
                  <TypeCheckbox
                    type="PERSON"
                    label="People"
                    checked={
                      visibleTypes.PERSON
                    }
                    onChange={() =>
                      setVisibleTypes(
                        (
                          current,
                        ) => ({
                          ...current,

                          PERSON:
                            !current.PERSON,
                        }),
                      )
                    }
                  />

                  <TypeCheckbox
                    type="ORGANIZATION"
                    label="Organizations"
                    checked={
                      visibleTypes.ORGANIZATION
                    }
                    onChange={() =>
                      setVisibleTypes(
                        (
                          current,
                        ) => ({
                          ...current,

                          ORGANIZATION:
                            !current.ORGANIZATION,
                        }),
                      )
                    }
                  />

                  <TypeCheckbox
                    type="BANK_ACCOUNT"
                    label="Accounts"
                    checked={
                      visibleTypes.BANK_ACCOUNT
                    }
                    onChange={() =>
                      setVisibleTypes(
                        (
                          current,
                        ) => ({
                          ...current,

                          BANK_ACCOUNT:
                            !current.BANK_ACCOUNT,
                        }),
                      )
                    }
                  />

                  <TypeCheckbox
                    type="EMAIL"
                    label="Emails"
                    checked={
                      visibleTypes.EMAIL
                    }
                    onChange={() =>
                      setVisibleTypes(
                        (
                          current,
                        ) => ({
                          ...current,

                          EMAIL:
                            !current.EMAIL,
                        }),
                      )
                    }
                  />
                </div>
              </div>

              {/* CONFIDENCE */}

              <div className="mt-8 border-t border-[#E7E9E5] pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A938E]">
                    Confidence
                  </div>

                  <div className="text-xs font-semibold text-[#0F4C3A]">
                    {
                      minimumConfidence
                    }
                    %+
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    minimumConfidence
                  }
                  onChange={(
                    event,
                  ) =>
                    setMinimumConfidence(
                      Number(
                        event
                          .target
                          .value,
                      ),
                    )
                  }
                  className="mt-4 w-full accent-[#0F4C3A]"
                />

                <p className="mt-2 text-[11px] leading-4 text-[#939B97]">
                  Hide
                  relationships below
                  this confidence
                  threshold.
                </p>
              </div>
            </aside>

            {/* ===========================================
                GRAPH CANVAS
            =========================================== */}

            <div className="relative min-h-0 bg-[#FCFCFA]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={
                  onNodesChange
                }
                onEdgesChange={
                  onEdgesChange
                }
                onEdgeClick={
                  handleEdgeClick
                }
                fitView
                fitViewOptions={{
                  padding: 0.25,
                }}
                minZoom={0.35}
                maxZoom={1.7}
              >
                <Background
                  gap={24}
                  size={1}
                  color="#E8EBE7"
                />

                <Controls
                  position="bottom-left"
                  showInteractive={
                    false
                  }
                />

                <MiniMap
                  position="bottom-right"
                  pannable
                  zoomable
                  maskColor="rgba(247,247,243,0.75)"
                />
              </ReactFlow>

              {/* GRAPH BADGE */}

              <div className="pointer-events-none absolute left-5 top-5 rounded-lg border border-[#E2E5E0] bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2">
                  <Network
                    size={14}
                    className="text-[#0F4C3A]"
                  />

                  <span className="text-xs font-medium text-[#4C5953]">
                    Investigation
                    network
                  </span>
                </div>
              </div>
            </div>

            {/* ===========================================
                RELATIONSHIP PANEL
            =========================================== */}

            <aside className="border-l border-[#E6E8E4] bg-white">
              {selectedRelationship ? (
                <RelationshipPanel
                  relationship={
                    selectedRelationship
                  }
                  caseId={
                    caseId
                  }
                  onClose={() =>
                    setSelectedRelationship(
                      null,
                    )
                  }
                />
              ) : (
                <div className="flex h-full items-center justify-center p-7 text-center">
                  <div>
                    <Network
                      size={25}
                      className="mx-auto text-[#A2AAA6]"
                    />

                    <h3 className="mt-3 text-sm font-semibold text-[#3F4C46]">
                      Select a
                      relationship
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#8B9490]">
                      Click a
                      connection in the
                      graph to inspect
                      its evidence and
                      confidence.
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   ENTITY NODE
========================================================= */

function EntityNode({
  name,
  type,
  confidence,
}: {
  name: string;

  type: EntityType;

  confidence: number;
}) {
  return (
    <div className="group w-[165px] rounded-xl border border-[#DCE2DD] bg-white px-4 py-3 shadow-[0_5px_16px_rgba(28,40,34,0.06)] transition hover:border-[#9BB5A8] hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F0EB] text-[#0F4C3A]">
          <EntityIcon
            type={type}
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-[#28332E]">
            {name}
          </div>

          <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#8A938E]">
            {formatLabel(
              type,
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#EFF0ED] pt-2">
        <span className="text-[9px] text-[#969E9A]">
          Confidence
        </span>

        <span className="text-[10px] font-semibold text-[#477765]">
          {Math.round(
            confidence * 100,
          )}
          %
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   RELATIONSHIP PANEL
========================================================= */

function RelationshipPanel({
  relationship,
  caseId,
  onClose,
}: {
  relationship: Relationship;

  caseId: string;

  onClose: () => void;
}) {
  const [
    evidenceOpen,
    setEvidenceOpen,
  ] = useState(false);

  const source = entities.find(
    (entity) =>
      entity.id ===
      relationship.source,
  );

  const target = entities.find(
    (entity) =>
      entity.id ===
      relationship.target,
  );

  return (
    <>
      <div className="flex h-full flex-col">
        {/* HEADER */}

        <div className="border-b border-[#ECEDE9] p-5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#87918C]">
              Relationship
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#7D8782] hover:bg-[#F1F2EE]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-[#26312C]">
              {source?.name}
            </div>

            <div className="my-2 inline-flex rounded-md bg-[#EAF1ED] px-2 py-1 text-[10px] font-semibold text-[#0F4C3A]">
              {formatLabel(
                relationship.type,
              )}
            </div>

            <div className="text-sm font-semibold text-[#26312C]">
              {target?.name}
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-5">
          {/* CONFIDENCE */}

          <DetailLabel label="Confidence" />

          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8ECE8]">
              <div
                className="h-full rounded-full bg-[#4E8B74]"
                style={{
                  width: `${
                    relationship.confidence *
                    100
                  }%`,
                }}
              />
            </div>

            <span className="text-sm font-semibold text-[#0F4C3A]">
              {Math.round(
                relationship.confidence *
                  100,
              )}
              %
            </span>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-6">
            <DetailLabel label="Description" />

            <p className="mt-2 text-sm leading-6 text-[#606C66]">
              {
                relationship.description
              }
            </p>
          </div>

          {/* SUPPORTING EVIDENCE */}

          <div className="mt-6">
            <DetailLabel label="Supporting Evidence" />

            <div className="mt-3 rounded-lg border border-[#E6E9E5] bg-[#FAFAF7] p-4">
              <div className="text-sm font-semibold text-[#39453F]">
                {
                  relationship.evidence
                    .length
                }{" "}
                {relationship
                  .evidence.length ===
                1
                  ? "evidence source"
                  : "evidence sources"}
              </div>

              <div className="mt-3 space-y-3">
                {relationship.evidence
                  .slice(0, 3)
                  .map(
                    (
                      evidence,
                    ) => (
                      <EvidenceSource
                        key={
                          evidence.id
                        }
                        file={
                          evidence.file
                        }
                        page={`Page ${evidence.page}`}
                      />
                    ),
                  )}
              </div>

              {relationship
                .evidence.length >
                3 && (
                <div className="mt-3 text-[10px] font-medium text-[#7D8782]">
                  +
                  {relationship
                    .evidence
                    .length -
                    3}{" "}
                  more
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#ECEDE9] p-5">
          <button
            type="button"
            onClick={() =>
              setEvidenceOpen(
                true,
              )
            }
            className="h-10 w-full rounded-lg bg-[#0F4C3A] text-sm font-medium text-white transition hover:bg-[#0A382B]"
          >
            View Relationship
            Evidence
          </button>
        </div>
      </div>

      {/* MODAL */}

      {evidenceOpen && (
        <RelationshipEvidenceModal
          relationship={
            relationship
          }
          caseId={caseId}
          sourceName={
            source?.name ||
            "Unknown"
          }
          targetName={
            target?.name ||
            "Unknown"
          }
          onClose={() =>
            setEvidenceOpen(
              false,
            )
          }
        />
      )}
    </>
  );
}

/* =========================================================
   RELATIONSHIP EVIDENCE MODAL
========================================================= */

function RelationshipEvidenceModal({
  relationship,
  caseId,
  sourceName,
  targetName,
  onClose,
}: {
  relationship: Relationship;

  caseId: string;

  sourceName: string;

  targetName: string;

  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[82vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="shrink-0 border-b border-[#ECEDE9] px-7 py-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                Relationship
                Evidence
              </div>

              <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.025em] text-[#18201D]">
                Supporting
                evidence
              </h2>

              <p className="mt-1 text-sm text-[#7A8580]">
                Review the
                original sources
                supporting this
                relationship.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#7D8782] transition hover:bg-[#F1F3EF]"
            >
              <X size={16} />
            </button>
          </div>

          {/* RELATIONSHIP SUMMARY */}

          <div className="mt-5 rounded-xl border border-[#E6E9E5] bg-[#FAFAF7] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#29342F]">
                {sourceName}
              </span>

              <span className="rounded-md bg-[#EAF1ED] px-2 py-1 text-[10px] font-semibold text-[#0F4C3A]">
                {formatLabel(
                  relationship.type,
                )}
              </span>

              <span className="text-sm font-semibold text-[#29342F]">
                {targetName}
              </span>
            </div>

            <div className="mt-2 text-xs text-[#87918C]">
              {Math.round(
                relationship.confidence *
                  100,
              )}
              % confidence ·{" "}
              {
                relationship.evidence
                  .length
              }{" "}
              evidence{" "}
              {relationship
                .evidence.length ===
              1
                ? "source"
                : "sources"}
            </div>
          </div>
        </div>

        {/* EVIDENCE LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
          <div className="space-y-4">
            {relationship.evidence.map(
              (
                evidence,
                index,
              ) => (
                <div
                  key={
                    evidence.id
                  }
                  className="rounded-xl border border-[#E4E7E3] bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    {/* ICON */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
                      <FileText
                        size={16}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* FILE HEADER */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#35413B]">
                            {
                              evidence.file
                            }
                          </div>

                          <div className="mt-1 text-xs text-[#929A96]">
                            Evidence{" "}
                            {index +
                              1}{" "}
                            · Page{" "}
                            {
                              evidence.page
                            }
                          </div>
                        </div>

                        {/* OPEN EVIDENCE */}

                        <Link
                          href={`/cases/${caseId}/evidence/${evidence.evidenceId}?page=${evidence.page}`}
                          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#DDE1DC] bg-white px-3 text-xs font-medium text-[#0F4C3A] transition hover:border-[#AABCB2] hover:bg-[#F3F7F4]"
                        >
                          Open
                          Evidence

                          <ExternalLink
                            size={12}
                          />
                        </Link>
                      </div>

                      {/* EXCERPT */}

                      <div className="mt-4 rounded-lg bg-[#F7F8F5] px-4 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8A938E]">
                          Supporting
                          passage
                        </div>

                        <p className="mt-2 text-sm leading-6 text-[#66716B]">
                          &ldquo;
                          {
                            evidence.excerpt
                          }
                          &rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-between border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <div className="text-xs text-[#8A938E]">
            {
              relationship.evidence
                .length
            }{" "}
            supporting{" "}
            {relationship
              .evidence.length ===
            1
              ? "source"
              : "sources"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm font-medium text-[#59645F] transition hover:bg-[#F3F4F0]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TYPE CHECKBOX
========================================================= */

function TypeCheckbox({
  type,
  label,
  checked,
  onChange,
}: {
  type: EntityType;

  label: string;

  checked: boolean;

  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={
          onChange
        }
        className="h-3.5 w-3.5 accent-[#0F4C3A]"
      />

      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF3F0] text-[#0F4C3A]">
        <EntityIcon
          type={type}
          size={12}
        />
      </div>

      <span className="text-xs text-[#59645E]">
        {label}
      </span>
    </label>
  );
}


/* =========================================================
   SUPPORTING EVIDENCE ROW
========================================================= */

function EvidenceSource({
  file,
  page,
}: {
  file: string;

  page: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="max-w-[160px] truncate text-xs font-medium text-[#4D5B54]">
        {file}
      </div>

      <div className="shrink-0 text-[10px] text-[#929A96]">
        {page}
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL LABEL
========================================================= */

function DetailLabel({
  label,
}: {
  label: string;
}) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8C9590]">
      {label}
    </div>
  );
}

