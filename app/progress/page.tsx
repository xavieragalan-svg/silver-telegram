"use client";

import EmptyState from "@/components/EmptyState";
import StatsCard from "@/components/StatsCard";
import { allSIECategories, calcProgressStats } from "@/lib/quiz";
import { loadPersistedState } from "@/lib/storage";
import type { ProgressStats, QuizAttempt } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const emptyProgress = (): ProgressStats => calcProgressStats([]);

export default function ProgressPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<ProgressStats>(emptyProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadPersistedState();
    setAttempts(s.attempts);
    setStats(calcProgressStats(s.attempts));
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </main>
    );
  }

  const ordered = [...attempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0033A0]">
            Progress
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Stats &amp; history
          </h1>
        </div>
        <Link
          href="/"
          className="self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm"
        >
          Home
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Accuracy by category
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allSIECategories().map((cat) => {
          const { correct, total } = stats.byCategory[cat];
          const pct =
            total === 0 ? "—" : `${Math.round((correct / total) * 1000) / 10}%`;
          return (
            <div
              key={cat}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
            >
              <p className="font-semibold text-slate-900">{cat}</p>
              <p className="mt-1 text-slate-600">
                {correct}/{total} correct ({pct})
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Quiz history
      </h2>

      {ordered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No quizzes yet"
            description="Finish a quiz to build your history and accuracy stats."
          >
            <Link
              href="/"
              className="rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-semibold text-white"
            >
              Start from home
            </Link>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {ordered.map((a) => {
                const n = a.totalQuestions;
                const pct =
                  n === 0 ? 0 : Math.round((a.score / n) * 1000) / 10;
                return (
                  <tr key={a.id} className="bg-white">
                    <td className="px-4 py-3">
                      {new Date(a.date).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {a.score}/{n}
                    </td>
                    <td className="px-4 py-3">{pct}%</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/results?sessionId=${encodeURIComponent(a.id)}`}
                        className="text-sm font-semibold text-[#0033A0] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
