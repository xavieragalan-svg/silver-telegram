"use client";

import AnswerChoices from "@/components/AnswerChoices";
import QuestionCard from "@/components/QuestionCard";
import QuizProgress from "@/components/QuizProgress";
import { buildQuestionMap, selectQuestions } from "@/lib/quiz";
import { questions } from "@/lib/questions";
import {
  clearActiveQuiz,
  completeQuizAndPersist,
  getActiveQuiz,
  persistActiveQuiz,
  type ActiveQuizState,
} from "@/lib/storage";
import type { AnsweredQuestion } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const questionMap = buildQuestionMap(questions);

export default function QuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<ActiveQuizState | null>(null);
  const quizRef = useRef<ActiveQuizState | null>(null);
  quizRef.current = quiz;

  useEffect(() => {
    const q = getActiveQuiz();
    if (q === null) {
      const initial: ActiveQuizState = {
        startedAt: new Date().toISOString(),
        questionIds: selectQuestions(questions),
        currentIndex: 0,
        answers: [],
        pendingChoiceIndex: null,
        showFeedback: false,
      };
      persistActiveQuiz(initial);
      setQuiz(initial);
      return;
    }
    setQuiz(q);
  }, [router]);

  const abandon = useCallback(() => {
    const ok = window.confirm(
      "End this quiz? Your progress on the current attempt will be lost.",
    );
    if (!ok) {
      return;
    }
    clearActiveQuiz();
    router.push("/");
  }, [router]);

  const handleSelect = useCallback((index: number) => {
    setQuiz((prev) => {
      if (prev === null || prev.showFeedback) {
        return prev;
      }
      const next = { ...prev, pendingChoiceIndex: index };
      persistActiveQuiz(next);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setQuiz((prev) => {
      if (
        prev === null ||
        prev.showFeedback ||
        prev.pendingChoiceIndex === null
      ) {
        return prev;
      }
      const qid = prev.questionIds[prev.currentIndex];
      const question = questionMap.get(qid);
      if (question === undefined) {
        return prev;
      }
      const idx = prev.pendingChoiceIndex;
      const selectedAnswer = question.choices[idx];
      const record: AnsweredQuestion = {
        questionId: qid,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        category: question.category,
      };
      const next = {
        ...prev,
        answers: [...prev.answers, record],
        showFeedback: true,
      };
      persistActiveQuiz(next);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    const q = quizRef.current;
    if (q === null || !q.showFeedback) {
      return;
    }
    const isLast = q.currentIndex === q.questionIds.length - 1;
    if (isLast) {
      const attempt = completeQuizAndPersist(q, questionMap);
      router.push(`/results?sessionId=${encodeURIComponent(attempt.id)}`);
      return;
    }
    const next: ActiveQuizState = {
      ...q,
      currentIndex: q.currentIndex + 1,
      pendingChoiceIndex: null,
      showFeedback: false,
    };
    persistActiveQuiz(next);
    setQuiz(next);
  }, [router]);

  if (quiz === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-slate-600 md:px-8">
        Preparing quiz…
      </main>
    );
  }

  const qid = quiz.questionIds[quiz.currentIndex];
  const question = questionMap.get(qid);
  if (question === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <p className="text-sm text-rose-700">Question not found.</p>
      </main>
    );
  }

  const total = quiz.questionIds.length;
  const currentNum = quiz.currentIndex + 1;
  const submitDisabled =
    quiz.pendingChoiceIndex === null || quiz.showFeedback;

  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 md:px-8">
          <p className="text-sm font-medium text-slate-700">Quiz in progress</p>
          <button
            type="button"
            onClick={abandon}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            End quiz
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <QuizProgress current={currentNum} total={total} />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <QuestionCard category={question.category} question={question.question} />
          <AnswerChoices
            choices={question.choices}
            selectedIndex={quiz.pendingChoiceIndex}
            correctAnswer={question.correctAnswer}
            showFeedback={quiz.showFeedback}
            onSelect={handleSelect}
          />

          {!quiz.showFeedback ? (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={submitDisabled}
                onClick={handleSubmit}
                className="rounded-xl bg-[#0033A0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-[#002280] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  quiz.answers[quiz.answers.length - 1]?.isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <p className="font-semibold">
                  {quiz.answers[quiz.answers.length - 1]?.isCorrect
                    ? "Correct."
                    : "Incorrect."}
                </p>
                <p className="mt-2 leading-relaxed">
                  <span className="font-medium">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-[#0033A0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002280]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
