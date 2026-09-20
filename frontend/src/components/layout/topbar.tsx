import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-[68px] items-center justify-between border-b border-[#E6E7E2] bg-[#FDFDFB] px-8">
      <div className="relative w-full max-w-[440px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949D98]"
        />

        <input
          type="text"
          placeholder="Search cases, evidence, entities..."
          className="h-10 w-full rounded-lg border border-[#E2E4DF] bg-[#F7F7F3] pl-10 pr-4 text-sm text-[#18201D] outline-none transition placeholder:text-[#9CA49F] focus:border-[#9CB5A7] focus:bg-white"
        />
      </div>

      <div className="ml-6 flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E5E1] bg-white text-[#59635F] hover:bg-[#F5F6F2]">
          <Bell size={17} />
        </button>

        <div className="h-8 w-px bg-[#E4E5E1]" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F4C3A] text-xs font-semibold text-white">
            JS
          </div>

          <div className="hidden lg:block">
            <div className="text-sm font-medium">Jawad Sabbah</div>
            <div className="text-[11px] text-[#89918D]">Investigator</div>
          </div>
        </div>
      </div>
    </header>
  );
}