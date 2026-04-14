const LABELS: readonly string[] = ["A", "B", "C", "D"];

export interface AnswerChoicesProps {
  choices: string[];
  selectedIndex: number | null;
  correctAnswer: string;
  showFeedback: boolean;
  onSelect: (index: number) => void;
}

export default function AnswerChoices({
  choices,
  selectedIndex,
  correctAnswer,
  showFeedback,
  onSelect,
}: AnswerChoicesProps) {
  return (
    <ul className="mt-6 space-y-3">
      {choices.map((text, index) => {
        const selected = selectedIndex === index;
        const isCorrectOption = text === correctAnswer;
        let ring = "border-slate-200 hover:border-slate-300";
        if (showFeedback) {
          if (isCorrectOption) {
            ring = "border-emerald-500 bg-emerald-50";
          } else if (selected && !isCorrectOption) {
            ring = "border-rose-500 bg-rose-50";
          } else {
            ring = "border-slate-200 opacity-60";
          }
        } else if (selected) {
          ring = "border-[#0033A0] bg-[#e6ebf5]";
        }

        return (
          <li key={index}>
            <button
              type="button"
              disabled={showFeedback}
              onClick={() => onSelect(index)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${ring}`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0033A0] text-xs font-bold text-white">
                {LABELS[index]}
              </span>
              <span className="leading-relaxed text-slate-800">{text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
