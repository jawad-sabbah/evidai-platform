import {Bot,ShieldCheck,Sparkles} from "lucide-react";
import {suggestedQuestions} from "@/data/mocks/ai";


export function EmptyConversation({
  caseNumber,
  onQuestion,
}: {
  caseNumber: string;

  onQuestion: (
    question: string,
  ) => void;
}) {
  return (
    <div className="flex min-h-full items-center justify-center px-8 py-10">
      <div className="w-full max-w-[760px]">
        {/* ICON */}

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0EB] text-[#0F4C3A]">
          <Bot size={24} />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-[#26312C]">
            Investigate the case
          </h2>

          <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#7A8580]">
            Ask EvidAI questions
            about evidence,
            entities,
            relationships,
            events, claims,
            flags and verified
            findings in{" "}
            <span className="font-medium text-[#4C5953]">
              {caseNumber}
            </span>
            .
          </p>
        </div>

        {/* SUGGESTIONS */}

        <div className="mt-8">
          <div className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.11em] text-[#929A96]">
            Suggested Questions
          </div>

          <div className="grid grid-cols-2 gap-3">
            {suggestedQuestions.map(
              (
                question,
              ) => (
                <button
                  key={
                    question
                  }
                  type="button"
                  onClick={() =>
                    onQuestion(
                      question,
                    )
                  }
                  className="group rounded-xl border border-[#E1E5E1] bg-[#FAFAF7] p-4 text-left transition hover:border-[#B9C8C0] hover:bg-[#F5F8F5]"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles
                      size={14}
                      className="mt-0.5 shrink-0 text-[#6D897C]"
                    />

                    <span className="text-xs font-medium leading-5 text-[#52605A] group-hover:text-[#0F4C3A]">
                      {
                        question
                      }
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        {/* SCOPE */}

        <div className="mx-auto mt-7 max-w-[560px] rounded-xl border border-[#E2E7E3] bg-[#F6F8F5] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#0F4C3A]"
            />

            <div>
              <div className="text-xs font-semibold text-[#405048]">
                Evidence-grounded
                analysis
              </div>

              <p className="mt-1 text-xs leading-5 text-[#75817A]">
                Answers should
                distinguish extracted
                intelligence from
                human-reviewed findings
                and provide source
                citations whenever
                evidence supports the
                answer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}