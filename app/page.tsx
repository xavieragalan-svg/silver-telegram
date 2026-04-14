"use client";

import StatsCard from "@/components/StatsCard";
import {
  calcProgressStats,
  emptyByCategory,
  quizLength,
  selectQuestions,
} from "@/lib/quiz";
import { questions } from "@/lib/questions";
import { loadPersistedState, persistActiveQuiz } from "@/lib/storage";
import type { ActiveQuizState } from "@/lib/storage";
import type { ProgressStats } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const emptyProgress: ProgressStats = {
  totalQuizzes: 0,
  bestScore: 0,
  averageScore: 0,
  totalQuestionsAnswered: 0,
  overallAccuracy: 0,
  byCategory: emptyByCategory(),
};

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<ProgressStats>(emptyProgress);
  const [missedCount, setMissedCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadPersistedState();
    setStats(calcProgressStats(s.attempts));
    setMissedCount(s.missed.length);
    setHydrated(true);
  }, []);

  const qLen = useMemo(() => quizLength(questions.length), []);

  const startQuiz = useCallback(() => {
    const initial: ActiveQuizState = {
      startedAt: new Date().toISOString(),
      questionIds: selectQuestions(questions),
      currentIndex: 0,
      answers: [],
      pendingChoiceIndex: null,
      showFeedback: false,
    };
    persistActiveQuiz(initial);
    router.push("/quiz");
  }, [router]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          SIE Study App
        </h1>
        <p className="max-w-2xl text-lg font-medium text-slate-700">
          Practice SIE questions, review mistakes, and track your progress.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
          Start a {qLen}-question randomized quiz from {questions.length} practice
          items. Everything saves in your browser only.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Quizzes completed" value={stats.totalQuizzes} />
        <StatsCard label="Best score (out of 10)" value={stats.bestScore} />
        <StatsCard
          label="Average score"
          value={stats.totalQuizzes === 0 ? "—" : stats.averageScore}
        />
        <StatsCard
          label="Overall accuracy"
          value={
            stats.totalQuestionsAnswered === 0
              ? "—"
              : `${stats.overallAccuracy}%`
          }
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startQuiz}
          className="rounded-xl bg-[#0033A0] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#002280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0033A0]"
        >
          Start {qLen}-question quiz
        </button>
        <Link
          href="/review"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Review missed ({missedCount})
        </Link>
        <Link
          href="/progress"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Progress
        </Link>
      </div>
    </main>
  );
}
