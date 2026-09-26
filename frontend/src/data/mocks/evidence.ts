export type EvidenceStatus =
  | "UPLOADED"
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type EvidenceType =
  | "PDF"
  | "DOCUMENT"
  | "SPREADSHEET"
  | "IMAGE"
  | "ARCHIVE"
  | "OTHER";

export type EvidenceItem = {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;

  name: string;
  type: EvidenceType;
  status: EvidenceStatus;

  size: string;
  pages?: number;

  uploadedBy: string;
  uploadedAt: string;

  progress?: number;
  processingError?: string;
};

/* =========================================================
   MOCK DATA
========================================================= */

export const initialEvidence: EvidenceItem[] = [
  {
    id: "ev-001",

    caseId: "1",

    caseNumber: "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "bank_statement.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "4.8 MB",

    pages:
      32,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 10:14",
  },

  {
    id:
      "ev-002",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "contract_acme.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "2.1 MB",

    pages:
      18,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 09:52",
  },

  {
    id:
      "ev-003",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "transactions.csv",

    type:
      "SPREADSHEET",

    status:
      "READY",

    size:
      "684 KB",

    uploadedBy:
      "Sarah Reed",

    uploadedAt:
      "Sep 23, 2026 · 16:40",
  },

  {
    id:
      "ev-004",

    caseId:
      "2",

    caseNumber:
      "INV-2026-002",

    caseTitle:
      "Offshore Transfers Review",

    name:
      "company_registry.pdf",

    type:
      "PDF",

    status:
      "QUEUED",

    size:
      "1.7 MB",

    pages:
      11,

    uploadedBy:
      "Sarah Reed",

    uploadedAt:
      "Sep 24, 2026 · 11:07",
  },

  {
    id:
      "ev-005",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "email_archive.zip",

    type:
      "ARCHIVE",

    status:
      "PROCESSING",

    size:
      "18.2 MB",

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 24, 2026 · 12:01",

    progress:
      68,
  },

  {
    id:
      "ev-006",

    caseId:
      "3",

    caseNumber:
      "INV-2026-003",

    caseTitle:
      "Procurement Fraud Investigation",

    name:
      "supplier_records.xlsx",

    type:
      "SPREADSHEET",

    status:
      "FAILED",

    size:
      "3.4 MB",

    uploadedBy:
      "Alex Morgan",

    uploadedAt:
      "Sep 24, 2026 · 08:35",

    processingError:
      "The spreadsheet could not be parsed because the workbook contains a corrupted worksheet.",
  },

  {
    id:
      "ev-007",

    caseId:
      "3",

    caseNumber:
      "INV-2026-003",

    caseTitle:
      "Procurement Fraud Investigation",

    name:
      "invoice_scan.jpg",

    type:
      "IMAGE",

    status:
      "UPLOADED",

    size:
      "2.9 MB",

    uploadedBy:
      "Alex Morgan",

    uploadedAt:
      "Sep 24, 2026 · 12:28",
  },

  {
    id:
      "ev-008",

    caseId:
      "1",

    caseNumber:
      "INV-2026-001",

    caseTitle:
      "Suspicious Payments Investigation",

    name:
      "interview_notes.pdf",

    type:
      "PDF",

    status:
      "READY",

    size:
      "1.3 MB",

    pages:
      9,

    uploadedBy:
      "Jawad Sabbah",

    uploadedAt:
      "Sep 22, 2026 · 14:10",
  },
];

/* =========================================================
   OPTIONS
========================================================= */

export const statusOptions: Array<
  "ALL" | EvidenceStatus
> = [
  "ALL",
  "READY",
  "PROCESSING",
  "QUEUED",
  "UPLOADED",
  "FAILED",
];

export const typeOptions: Array<
  "ALL" | EvidenceType
> = [
  "ALL",
  "PDF",
  "DOCUMENT",
  "SPREADSHEET",
  "IMAGE",
  "ARCHIVE",
  "OTHER",
];