import type {
  AnsweredQuestion,
  MissedQuestion,
  Question,
  QuizAttempt,
  SIECategory,
} from "@/types";

export const PERSIST_STORAGE_KEY = "sie-study-app:v2";
export const ACTIVE_QUIZ_STORAGE_KEY = "sie-study-app:active-quiz";

export interface ActiveQuizState {
  startedAt: string;
  questionIds: string[];
  currentIndex: number;
  answers: AnsweredQuestion[];
  pendingChoiceIndex: number | null;
  showFeedback: boolean;
}

interface SiePersistedState {
  version: 2;
  attempts: QuizAttempt[];
  missed: MissedQuestion[];
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStorageItem(key: string): string | null {
  if (!canUseStorage()) {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota or privacy mode */
  }
}

export function removeStorageItem(key: string): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function isSIECategory(value: unknown): value is SIECategory {
  return (
    value === "Capital Markets" ||
    value === "Securities Products" ||
    value === "Customer Accounts" ||
    value === "Trading" ||
    value === "Regulatory Rules"
  );
}

function isQuestion(value: unknown): value is Question {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const r = value as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    typeof r.question !== "string" ||
    typeof r.explanation !== "string" ||
    typeof r.correctAnswer !== "string"
  ) {
    return false;
  }
  if (!isSIECategory(r.category)) {
    return false;
  }
  if (!Array.isArray(r.choices) || r.choices.length !== 4) {
    return false;
  }
  if (!r.choices.every((c): c is string => typeof c === "string")) {
    return false;
  }
  return r.choices.includes(r.correctAnswer);
}

function isMissedQuestion(value: unknown): value is MissedQuestion {
  if (!isQuestion(value)) {
    return false;
  }
  const r = value as unknown as Record<string, unknown>;
  return (
    typeof r.lastAttemptDate === "string" &&
    typeof r.selectedAnswer === "string"
  );
}

function isAnsweredQuestion(value: unknown): value is AnsweredQuestion {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const r = value as Record<string, unknown>;
  return (
    typeof r.questionId === "string" &&
    typeof r.selectedAnswer === "string" &&
    typeof r.correctAnswer === "string" &&
    typeof r.isCorrect === "boolean" &&
    isSIECategory(r.category)
  );
}

function isQuizAttempt(value: unknown): value is QuizAttempt {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const r = value as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    typeof r.date !== "string" ||
    typeof r.score !== "number" ||
    typeof r.totalQuestions !== "number" ||
    !Array.isArray(r.answers)
  ) {
    return false;
  }
  if (!r.answers.every(isAnsweredQuestion)) {
    return false;
  }
  if (r.score < 0 || r.score > r.totalQuestions) {
    return false;
  }
  return true;
}

export function parsePersistedState(raw: string): SiePersistedState {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") {
      return emptyPersistedState();
    }
    const r = parsed as Record<string, unknown>;
    if (r.version !== 2) {
      return emptyPersistedState();
    }
    const attempts = r.attempts;
    const missed = r.missed;
    if (!Array.isArray(attempts) || !Array.isArray(missed)) {
      return emptyPersistedState();
    }
    return {
      version: 2,
      attempts: attempts.filter(isQuizAttempt),
      missed: missed.filter(isMissedQuestion),
    };
  } catch {
    return emptyPersistedState();
  }
}

export function emptyPersistedState(): SiePersistedState {
  return { version: 2, attempts: [], missed: [] };
}

export function serializePersistedState(state: SiePersistedState): string {
  return JSON.stringify(state);
}

export function loadPersistedState(): SiePersistedState {
  const raw = getStorageItem(PERSIST_STORAGE_KEY);
  if (raw === null) {
    return emptyPersistedState();
  }
  return parsePersistedState(raw);
}

export function savePersistedState(state: SiePersistedState): void {
  setStorageItem(PERSIST_STORAGE_KEY, serializePersistedState(state));
}

function mergeMissedFromAttempt(
  current: MissedQuestion[],
  answers: AnsweredQuestion[],
  questionMap: Map<string, Question>,
  when: string,
): MissedQuestion[] {
  const map = new Map(current.map((m) => [m.id, { ...m }]));
  for (const a of answers) {
    if (a.isCorrect) {
      continue;
    }
    const q = questionMap.get(a.questionId);
    if (q === undefined) {
      continue;
    }
    map.set(q.id, {
      ...q,
      lastAttemptDate: when,
      selectedAnswer: a.selectedAnswer,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function isChoiceIndex(value: unknown): value is 0 | 1 | 2 | 3 {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

export function parseActiveQuiz(raw: string): ActiveQuizState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") {
      return null;
    }
    const r = parsed as Record<string, unknown>;
    if (
      typeof r.startedAt !== "string" ||
      typeof r.currentIndex !== "number" ||
      typeof r.showFeedback !== "boolean" ||
      !Array.isArray(r.questionIds) ||
      !Array.isArray(r.answers) ||
      !r.questionIds.every((id): id is string => typeof id === "string") ||
      !r.answers.every(isAnsweredQuestion)
    ) {
      return null;
    }
    let pendingChoiceIndex: number | null = null;
    if (r.pendingChoiceIndex !== null && r.pendingChoiceIndex !== undefined) {
      if (!isChoiceIndex(r.pendingChoiceIndex)) {
        return null;
      }
      pendingChoiceIndex = r.pendingChoiceIndex;
    } else if (isChoiceIndex(r.pendingChoice)) {
      pendingChoiceIndex = r.pendingChoice;
    }
    return {
      startedAt: r.startedAt,
      questionIds: r.questionIds,
      currentIndex: r.currentIndex,
      answers: r.answers,
      pendingChoiceIndex,
      showFeedback: r.showFeedback,
    };
  } catch {
    return null;
  }
}

export function getActiveQuiz(): ActiveQuizState | null {
  const raw = getStorageItem(ACTIVE_QUIZ_STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  return parseActiveQuiz(raw);
}

export function setActiveQuiz(state: ActiveQuizState): void {
  setStorageItem(ACTIVE_QUIZ_STORAGE_KEY, JSON.stringify(state));
}

export function clearActiveQuiz(): void {
  removeStorageItem(ACTIVE_QUIZ_STORAGE_KEY);
}

export function persistActiveQuiz(state: ActiveQuizState): void {
  setActiveQuiz(state);
}

export function findAttemptById(
  attempts: QuizAttempt[],
  id: string,
): QuizAttempt | undefined {
  return attempts.find((a) => a.id === id);
}

export function completeQuizAndPersist(
  final: ActiveQuizState,
  questionMap: Map<string, Question>,
): QuizAttempt {
  const completedAt = new Date().toISOString();
  const score = final.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = final.questionIds.length;
  const attempt: QuizAttempt = {
    id: crypto.randomUUID(),
    date: completedAt,
    score,
    totalQuestions,
    answers: final.answers,
  };
  const prev = loadPersistedState();
  const missed = mergeMissedFromAttempt(
    prev.missed,
    attempt.answers,
    questionMap,
    completedAt,
  );
  savePersistedState({
    version: 2,
    attempts: [...prev.attempts, attempt],
    missed,
  });
  clearActiveQuiz();
  return attempt;
}

export function replaceMissedQuestions(entries: MissedQuestion[]): void {
  const prev = loadPersistedState();
  savePersistedState({
    version: 2,
    attempts: prev.attempts,
    missed: entries,
  });
}
