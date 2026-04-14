import type { SIECategory } from "@/types";

export interface QuestionCardProps {
  category: SIECategory;
  question: string;
}

export default function QuestionCard({ category, question }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <span className="inline-block rounded-full bg-[#e6ebf5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0033A0]">
        {category}
      </span>
      <h2 className="text-lg font-semibold leading-snug text-slate-900 md:text-xl">
        {question}
      </h2>
    </div>
  );
}
