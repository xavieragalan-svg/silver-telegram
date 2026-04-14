"use client";

import EmptyState from "@/components/EmptyState";
import { loadPersistedState, replaceMissedQuestions } from "@/lib/storage";
import type { MissedQuestion } from "@/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ReviewPage() {
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMissed(loadPersistedState().missed);
    setHydrated(true);
  }, []);

  const clear = useCallback(() => {
    if (missed.length === 0) {
      return;
    }
    const ok = window.confirm("Clear every entry from your missed log?");
    if (!ok) {
      return;
    }
    replaceMissedQuestions([]);
    setMissed([]);
  }, [missed.length]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </main>
    );
  }

  const sorted = [...missed].sort(
    (a, b) =>
      new Date(b.lastAttemptDate).getTime() -
      new Date(a.lastAttemptDate).getTime(),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0033A0]">
            Missed questions
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Cross-session review
          </h1>
          <p className="max-w-xl text-sm text-slate-600">
            Items you missed across quizzes. Clearing the log does not delete quiz
            history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={clear}
            disabled={missed.length === 0}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear log
          </button>
        </div>
      </header>

      {sorted.length === 0 ? (
        <EmptyState
          title="No missed questions yet"
          description="Take a quiz — any incorrect answers will appear here for review."
        >
          <Link
            href="/quiz"
            className="rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to quiz
          </Link>
        </EmptyState>
      ) : (
        <ul className="space-y-5">
          {sorted.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {m.category}
                </span>
                <span className="text-xs text-slate-500">
                  Last{" "}
                  {new Date(m.lastAttemptDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-3 font-medium text-slate-900">{m.question}</p>
              <p className="mt-2 text-sm text-rose-800">
                You selected: {m.selectedAnswer}
              </p>
              <ol className="mt-4 space-y-2 text-sm text-slate-700">
                {m.choices.map((c, i) => (
                  <li
                    key={i}
                    className={
                      c === m.correctAnswer ? "font-semibold text-emerald-800" : ""
                    }
                  >
                    <span className="font-mono text-xs text-slate-500">
                      {String.fromCharCode(65 + i)}.
                    </span>{" "}
                    {c}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">
                  Explanation:{" "}
                </span>
                {m.explanation}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
