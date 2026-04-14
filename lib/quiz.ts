import type {
  ProgressStats,
  Question,
  QuizAttempt,
  SIECategory,
} from "@/types";

const DEFAULT_QUIZ_LENGTH = 10;

const ALL_CATEGORIES: readonly SIECategory[] = [
  "Capital Markets",
  "Securities Products",
  "Customer Accounts",
  "Trading",
  "Regulatory Rules",
] as const;

export function emptyByCategory(): ProgressStats["byCategory"] {
  const out = {} as ProgressStats["byCategory"];
  for (const c of ALL_CATEGORIES) {
    out[c] = { correct: 0, total: 0 };
  }
  return out;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function selectQuestions(bank: Question[]): string[] {
  const ids = shuffle(bank.map((q) => q.id));
  const n = Math.min(DEFAULT_QUIZ_LENGTH, bank.length);
  return ids.slice(0, n);
}

export function buildQuestionMap(bank: Question[]): Map<string, Question> {
  return new Map(bank.map((q) => [q.id, q]));
}

export function calcProgressStats(attempts: QuizAttempt[]): ProgressStats {
  if (attempts.length === 0) {
    return {
      totalQuizzes: 0,
      bestScore: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      byCategory: emptyByCategory(),
    };
  }

  let bestScore = 0;
  let sumScore = 0;
  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;
  const byCategory = emptyByCategory();

  for (const attempt of attempts) {
    bestScore = Math.max(bestScore, attempt.score);
    sumScore += attempt.score;
    for (const ans of attempt.answers) {
      totalQuestionsAnswered += 1;
      if (ans.isCorrect) {
        totalCorrect += 1;
      }
      const bucket = byCategory[ans.category];
      bucket.total += 1;
      if (ans.isCorrect) {
        bucket.correct += 1;
      }
    }
  }

  const overallAccuracy =
    totalQuestionsAnswered === 0
      ? 0
      : Math.round((totalCorrect / totalQuestionsAnswered) * 1000) / 10;

  return {
    totalQuizzes: attempts.length,
    bestScore,
    averageScore: Math.round((sumScore / attempts.length) * 100) / 100,
    totalQuestionsAnswered,
    overallAccuracy,
    byCategory,
  };
}

export function quizLength(bankSize: number): number {
  return Math.min(DEFAULT_QUIZ_LENGTH, bankSize);
}

export function allSIECategories(): readonly SIECategory[] {
  return ALL_CATEGORIES;
}
