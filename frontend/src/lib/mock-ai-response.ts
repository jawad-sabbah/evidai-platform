import {Citation} from "@/data/mocks/ai";
import {createId} from "@/lib/ai-utils";

export function buildMockResponse(
  question: string,
): {
  content: string;
  citations: Citation[];
} {
  const value =
    question.toLowerCase();

  /* JOHN / ACME */

  if (
    value.includes(
      "john smith",
    ) &&
    value.includes("acme")
  ) {
    return {
      content:
        "John Smith appears connected to ACME Ltd through a documented corporate role. Corporate registry evidence identifies him as a director, while a contract references him as acting on behalf of ACME Ltd. This connection is also represented in the case relationship graph as DIRECTOR_OF.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-004",

          file:
            "company_registry.pdf",

          page:
            7,

          excerpt:
            "John Smith is listed as a director of ACME Ltd.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-002",

          file:
            "contract_acme.pdf",

          page:
            12,

          excerpt:
            "The agreement identifies John Smith as acting on behalf of ACME Ltd.",
        },
      ],
    };
  }

  /* PAYMENT */

  if (
    value.includes(
      "payment",
    ) ||
    value.includes(
      "transfer",
    )
  ) {
    return {
      content:
        "The case contains several high-value payment events. One documented transfer of $100,000 involved an account associated with John Smith and ACME Ltd. The investigation also contains a flag for an unusual payment pattern because multiple high-value transfers occurred within a short period.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            12,

          excerpt:
            "Transfer of $100,000 from Account 3281 to ACME Ltd.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-003",

          file:
            "transactions.csv",

          page:
            1,

          excerpt:
            "Three high-value transfers occurred within five days.",
        },
      ],
    };
  }

  /* CLAIMS */

  if (
    value.includes(
      "claim",
    ) ||
    value.includes(
      "contradict",
    )
  ) {
    return {
      content:
        "The case contains claims that conflict with documentary evidence. One notable example is John Smith's statement that he never worked for ACME Ltd. Corporate registry evidence identifies him as a director, so that claim is currently categorized as contradicted.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-006",

          file:
            "interview_notes.pdf",

          page:
            5,

          excerpt:
            "John Smith stated that he had never worked for ACME Ltd.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-004",

          file:
            "company_registry.pdf",

          page:
            7,

          excerpt:
            "John Smith is listed as a director of ACME Ltd.",
        },
      ],
    };
  }

  /* TIMELINE */

  if (
    value.includes(
      "timeline",
    ) ||
    value.includes(
      "offshore",
    )
  ) {
    return {
      content:
        "The timeline shows a sequence of activity involving corporate changes and financial transfers. A high-value payment was recorded before a later authorization-related email, creating a timeline inconsistency that was flagged for investigator review.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            24,

          excerpt:
            "Transaction was completed on April 2.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-012",

          file:
            "approval_email.pdf",

          page:
            2,

          excerpt:
            "Approval email timestamp is April 3.",
        },
      ],
    };
  }

  /* FINDINGS */

  if (
    value.includes(
      "finding",
    ) ||
    value.includes(
      "verified",
    )
  ) {
    return {
      content:
        "The investigation contains reviewed findings derived from flags and supporting evidence. Verified findings are investigator-approved conclusions and are eligible to feed formal report generation. Draft or rejected findings should not be treated as verified conclusions.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-004",

          file:
            "company_registry.pdf",

          page:
            7,

          excerpt:
            "John Smith is listed as a director of ACME Ltd.",
        },
      ],
    };
  }

  /* GLOBAL HOLDINGS */

  if (
    value.includes(
      "global holdings",
    )
  ) {
    return {
      content:
        "Global Holdings appears in the case as an organization connected to ACME Ltd through financial activity. The relationship graph includes a TRANSFERRED_TO connection from ACME Ltd to Global Holdings based on banking and transaction evidence.",

      citations: [
        {
          id:
            createId(),

          evidenceId:
            "ev-001",

          file:
            "bank_statement.pdf",

          page:
            24,

          excerpt:
            "International transfer from ACME Ltd to Global Holdings.",
        },

        {
          id:
            createId(),

          evidenceId:
            "ev-003",

          file:
            "transactions.csv",

          page:
            1,

          excerpt:
            "Transaction export records Global Holdings as the receiving party.",
        },
      ],
    };
  }

  /* FALLBACK */

  return {
    content:
      "I could not find enough mock case intelligence to answer that question confidently. In the backend version, EvidAI should search evidence chunks, entities, relationships, events, claims, flags and verified findings before generating a grounded answer.",

    citations: [],
  };
}