export function getInputClassName(error: boolean) {
  return `h-11 w-full rounded-lg border bg-white pl-10 pr-4 text-sm text-[#26312C] outline-none transition placeholder:text-[#A0A8A4] ${
    error
      ? "border-[#D8A29C] focus:border-[#C2685E]"
      : "border-[#DDE2DD] focus:border-[#8FA99B] focus:ring-2 focus:ring-[#E9F0EC]"
  }`;
}