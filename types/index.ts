export interface Question {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  category: SIECategory;
}

export type SIECategory =
  | "Capital Markets"
  | "Securities Products"
  | "Customer Accounts"
  | "Trading"
  | "Regulatory Rules";

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  answers: AnsweredQuestion[];
}

export interface AnsweredQuestion {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: SIECategory;
}

export interface MissedQuestion extends Question {
  lastAttemptDate: string;
  selectedAnswer: string;
}

export interface ProgressStats {
  totalQuizzes: number;
  bestScore: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  byCategory: Record<
    SIECategory,
    {
      correct: number;
      total: number;
    }
  >;
}
