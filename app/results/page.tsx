"use client";

import EmptyState from "@/components/EmptyState";
import { buildQuestionMap } from "@/lib/quiz";
import { questions } from "@/lib/questions";
import { findAttemptById, loadPersistedState } from "@/lib/storage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

const questionMap = buildQuestionMap(questions);

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const attempt = useMemo(() => {
    if (sessionId === null || sessionId === "") {
      return undefined;
    }
    const { attempts } = loadPersistedState();
    return findAttemptById(attempts, sessionId);
  }, [sessionId]);

  if (sessionId === null || sessionId === "") {
    return (
      <EmptyState
        title="No quiz selected"
        description="Complete a quiz to see results here, or open a past attempt from Progress."
      >
        <Link
          href="/"
          className="rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-semibold text-white"
        >
          Home
        </Link>
        <Link
          href="/progress"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Progress
        </Link>
      </EmptyState>
    );
  }

  if (attempt === undefined) {
    return (
      <EmptyState
        title="Results not found"
        description="That quiz may have been cleared from this browser, or the link is invalid."
      >
        <Link
          href="/"
          className="rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-semibold text-white"
        >
          Home
        </Link>
      </EmptyState>
    );
  }

  const total = attempt.totalQuestions;
  const missed = attempt.answers.filter((a) => !a.isCorrect);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0033A0]">
          Quiz complete
        </p>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          You scored {attempt.score} out of {total}
        </h1>
        <p className="text-sm text-slate-600">
          {new Date(attempt.date).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#0033A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Home
        </Link>
        <Link
          href="/review"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm"
        >
          Review missed log
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Missed on this quiz ({missed.length})
        </h2>
        {missed.length === 0 ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-6 text-sm text-emerald-900">
            Perfect run — every answer was correct.
          </p>
        ) : (
          <ul className="space-y-4">
            {missed.flatMap((a) => {
              const q = questionMap.get(a.questionId);
              if (q === undefined) {
                return [];
              }
              return [
                <li
                  key={`${attempt.id}-${a.questionId}`}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {q.category}
                  </p>
                  <p className="mt-2 font-medium text-slate-900">{q.question}</p>
                  <p className="mt-3 text-sm text-rose-800">
                    Your answer: {a.selectedAnswer}
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Correct: {a.correctAnswer}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    {q.explanation}
                  </p>
                </li>,
              ];
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-0 py-6">
      <Suspense
        fallback={
          <p className="text-center text-sm text-slate-600">Loading results…</p>
        }
      >
        <ResultsContent />
      </Suspense>
    </main>
  );
}
