import {EvidenceType} from "@/data/mocks/evidence";


export function inferEvidenceType(
  fileName: string,
): EvidenceType {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "pdf"
  ) {
    return "PDF";
  }

  if (
    [
      "doc",
      "docx",
      "txt",
      "eml",
    ].includes(
      extension ?? "",
    )
  ) {
    return "DOCUMENT";
  }

  if (
    [
      "csv",
      "xls",
      "xlsx",
    ].includes(
      extension ?? "",
    )
  ) {
    return "SPREADSHEET";
  }

  if (
    [
      "jpg",
      "jpeg",
      "png",
    ].includes(
      extension ?? "",
    )
  ) {
    return "IMAGE";
  }

  if (
    extension ===
    "zip"
  ) {
    return "ARCHIVE";
  }

  return "OTHER";
}

