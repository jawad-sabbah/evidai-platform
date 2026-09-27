import {Sparkles} from "lucide-react";


export function ThinkingMessage() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
        <Sparkles
          size={15}
          className="animate-pulse"
        />
      </div>

      <div className="rounded-xl border border-[#E5E8E4] bg-[#FAFAF7] px-4 py-3">
        <div className="flex items-center gap-2">
          <ThinkingDot delay="0ms" />
          <ThinkingDot delay="150ms" />
          <ThinkingDot delay="300ms" />

          <span className="ml-1 text-xs text-[#7C8781]">
            Searching case
            evidence…
          </span>
        </div>
      </div>
    </div>
  );
}

export function ThinkingDot({
  delay,
}: {
  delay: string;
}) {
  return (
    <div
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7E958A]"
      style={{
        animationDelay:
          delay,
      }}
    />
  );
}


