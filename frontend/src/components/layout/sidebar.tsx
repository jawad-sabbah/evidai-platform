"use client";

import Link from "next/link";
import {
  BrainCircuit,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";



const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Cases",
    icon: BriefcaseBusiness,
    href: "/cases",
  },
  {
    label: "Evidence",
    icon: FileText,
    href: "/evidence",
  },
  {
    label: "AI Investigator",
    icon: Sparkles,
    href: "/ai",
  },
];


export function Sidebar() {
  return (
    <aside className="flex h-full w-[236px] flex-col border-r border-[#E6E7E2] bg-[#FBFBF8] px-4 py-5">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F4C3A] text-white">
          <BrainCircuit size={19} />
        </div>

        <div>
          <div className="text-[17px] font-semibold tracking-tight text-[#18201D]">
            EvidAI
          </div>

          <div className="text-[10px] uppercase tracking-[0.16em] text-[#7B8580]">
            Intelligence
          </div>
        </div>
      </div>

      <div className="mt-9 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9AA29E]">
        Workspace
      </div>

      <nav className="mt-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#59635F] transition hover:bg-[#F0F1ED] hover:text-[#18201D]"
            >
              <Icon size={17} strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#59635F] transition hover:bg-[#F0F1ED]">
          <Settings size={17} strokeWidth={1.8} />
          Settings
        </button>

        <div className="mt-4 border-t border-[#E6E7E2] pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDE7E1] text-sm font-semibold text-[#0F4C3A]">
              JS
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[#18201D]">
                Jawad Sabbah
              </div>

              <div className="text-xs text-[#89918D]">Investigator</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}