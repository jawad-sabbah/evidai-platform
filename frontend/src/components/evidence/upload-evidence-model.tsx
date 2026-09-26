import { useState } from "react";
import { X, Upload } from "lucide-react";


export function UploadEvidenceModal({
  cases,
  onClose,
  onUpload,
}: {
  cases: {
    id: string;
    number: string;
    title: string;
  }[];

  onClose:
    () => void;

  onUpload:
    (data: {
      caseId: string;
      name: string;
    }) => void;
}) {
  const [
    caseId,
    setCaseId,
  ] =
    useState(
      cases[0]?.id ??
        "",
    );

  const [
    fileName,
    setFileName,
  ] =
    useState(
      "new_evidence.pdf",
    );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[590px] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_24px_80px_rgba(25,35,30,0.18)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#ECEDE9] px-7 py-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
              Evidence Upload
            </div>

            <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-[#18201D]">
              Upload evidence
            </h2>

            <p className="mt-1 text-sm text-[#74807A]">
              Add a new evidence
              item to an active
              investigation.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8782] hover:bg-[#F1F3EF]"
          >
            <X
              size={16}
            />
          </button>
        </div>

        {/* BODY */}

        <div className="px-7 py-6">
          {/* CASE */}

          <label className="text-sm font-medium text-[#35413B]">
            Case
          </label>

          <select
            value={
              caseId
            }
            onChange={(
              event,
            ) =>
              setCaseId(
                event.target
                  .value,
              )
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm outline-none"
          >
            {cases.map(
              (
                item,
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.id
                  }
                >
                  {
                    item.number
                  }{" "}
                  —{" "}
                  {
                    item.title
                  }
                </option>
              ),
            )}
          </select>

          {/* MOCK FILE */}

          <div className="mt-6">
            <label className="text-sm font-medium text-[#35413B]">
              Evidence file
            </label>

            <div className="mt-2 rounded-xl border-2 border-dashed border-[#D7DDD8] bg-[#FAFAF7] p-7 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#0F4C3A]">
                <Upload
                  size={18}
                />
              </div>

              <div className="mt-3 text-sm font-medium text-[#45514B]">
                Upload evidence
              </div>

              <p className="mt-1 text-xs text-[#89928D]">
                Frontend mock for
                now. Real file
                upload will be
                connected to the
                backend.
              </p>

              <input
                value={
                  fileName
                }
                onChange={(
                  event,
                ) =>
                  setFileName(
                    event.target
                      .value,
                  )
                }
                className="mt-4 h-10 w-full rounded-lg border border-[#DDE1DC] bg-white px-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t border-[#ECEDE9] bg-[#FCFCFA] px-7 py-5">
          <button
            type="button"
            onClick={
              onClose
            }
            className="h-10 rounded-lg border border-[#DEE1DC] bg-white px-5 text-sm font-medium text-[#59645F]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !caseId ||
              !fileName.trim()
            }
            onClick={() =>
              onUpload({
                caseId,

                name:
                  fileName.trim(),
              })
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F4C3A] px-5 text-sm font-medium text-white hover:bg-[#0A382B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload
              size={14}
            />

            Upload Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
