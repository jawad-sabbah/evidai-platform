import {ShieldCheck,Sparkles,User,FileText} from "lucide-react";
import Link from "next/link";

import {ChatMessage} from "@/data/mocks/ai";

export function MessageItem({
  message,
  caseId,
}: {
  message: ChatMessage;

  caseId: string;
}) {
  const isUser =
    message.role ===
    "USER";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[680px]">
          <div className="flex items-start justify-end gap-3">
            <div>
              <div className="rounded-2xl rounded-tr-md bg-[#F0F3F0] px-5 py-3.5">
                <p className="text-sm leading-6 text-[#34413B]">
                  {
                    message.content
                  }
                </p>
              </div>

              <div className="mt-1.5 text-right text-[10px] text-[#A0A7A3]">
                {
                  message.createdAt
                }
              </div>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E2ECE7] text-[#0F4C3A]">
              <User size={14} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* AI ICON */}

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
        <Sparkles size={15} />
      </div>

      <div className="min-w-0 max-w-[760px] flex-1">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-[#2E3A34]">
            EvidAI
          </div>

          <div className="text-[10px] text-[#9AA29E]">
            {
              message.createdAt
            }
          </div>
        </div>

        {/* ANSWER */}

        <div className="mt-2 text-sm leading-7 text-[#53605A]">
          {
            message.content
          }
        </div>

        {/* SOURCES */}

        {message.citations &&
          message.citations
            .length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <FileText
                  size={13}
                  className="text-[#718079]"
                />

                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#87918C]">
                  Sources
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {message.citations.map(
                  (
                    citation,
                    index,
                  ) => (
                    <div
                      key={
                        citation.id
                      }
                      className="rounded-xl border border-[#E3E7E3] bg-[#FAFAF7] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E6EEE9] text-[10px] font-semibold text-[#0F4C3A]">
                          {
                            index +
                            1
                          }
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-semibold text-[#435049]">
                            {
                              citation.file
                            }
                          </div>

                          <div className="mt-0.5 text-[10px] text-[#949C98]">
                            Page{" "}
                            {
                              citation.page
                            }
                          </div>
                        </div>

                        <Link
                          href={`/cases/${caseId}/evidence/${citation.evidenceId}?page=${citation.page}`}
                          className="shrink-0 text-xs font-medium text-[#0F4C3A] transition hover:underline"
                        >
                          Open Evidence
                        </Link>
                      </div>

                      <p className="mt-3 border-l-2 border-[#DCE5DF] pl-3 text-xs leading-5 text-[#78827D]">
                        &ldquo;
                        {
                          citation.excerpt
                        }
                        &rdquo;
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* GROUNDED LABEL */}

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#8B9490]">
          <ShieldCheck
            size={11}
          />

          Grounded in case
          evidence
        </div>
      </div>
    </div>
  );
}
