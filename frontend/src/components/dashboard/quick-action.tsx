import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;

  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[#E3E6E2] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#C8D6CE] hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A] transition group-hover:bg-[#E4EEE8]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#3E4B44]">
          {title}
        </div>

        <div className="mt-0.5 text-[10px] text-[#8A938E]">
          {description}
        </div>
      </div>

      <ArrowRight
        size={13}
        className="text-[#A0A7A3] transition group-hover:translate-x-0.5 group-hover:text-[#0F4C3A]"
      />
    </Link>
  );
}

