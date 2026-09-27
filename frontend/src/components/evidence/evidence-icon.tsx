import {FileText,FileSpreadsheet,FileArchive,ImageIcon} from "lucide-react";

import {EvidenceType} from "@/data/mocks/evidence";

export function EvidenceIcon({
  type,
}: {
  type:
    EvidenceType;
}) {
  const className =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3F0] text-[#0F4C3A]";

  if (
    type ===
    "SPREADSHEET"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <FileSpreadsheet
          size={17}
        />
      </div>
    );
  }

  if (
    type ===
    "IMAGE"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <ImageIcon
          size={17}
        />
      </div>
    );
  }

  if (
    type ===
    "ARCHIVE"
  ) {
    return (
      <div
        className={
          className
        }
      >
        <FileArchive
          size={17}
        />
      </div>
    );
  }

  return (
    <div
      className={
        className
      }
    >
      <FileText
        size={17}
      />
    </div>
  );
}