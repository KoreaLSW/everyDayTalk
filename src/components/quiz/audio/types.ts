import { Question, Option } from "@/hooks/useQuizData";

export interface AudioQuizData {
  word_id: string;
  word: string;
  reading: string;
  meanings: string[];
  level: string;
}

// useQuizData의 Option과 호환되는 타입 별칭
export type QuizOption = Option;

export interface QuizSettings {
  level: string;
  questionCount: number;
}

export enum QuizState {
  SETTINGS = "settings",
  PROGRESS = "progress",
  RESULT = "result",
}

export interface AudioQuizProps {
  session: any;
  router: any;
}

export interface AudioControlsProps {
  currentQuestion: Question;
  isPlaying: boolean;
  canSpeak: boolean;
  onSpeak: (text: string, speed: number) => void;
  onStop: () => void;
}

export interface QuestionOptionsProps {
  options: Option[];
  selectedAnswer: number | null;
  showResult: boolean;
  onAnswerSelect: (index: number) => void;
}

export interface AudioQuizProgressProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  options: Option[];
  selectedAnswer: number | null;
  showResult: boolean;
  settings: QuizSettings;
  isPlaying: boolean;
  canSpeak: boolean;
  onAnswerSelect: (index: number) => void;
  onNextQuestion: () => void;
  onRestart: () => void;
  onSpeak: (text: string, speed?: number) => void;
  onStopSpeaking: () => void;
  wordInfo: {
    word_id: string;
    word: string;
    reading: string;
    meanings: string[];
    kanji?: string;
  };
  QuestionOptionsComponent?: React.ComponentType<QuestionOptionsProps>;
  title?: string;
  description?: string;
}

export interface AudioQuizSettingsProps {
  settings: QuizSettings;
  onSettingsChange: (
    setting: "level" | "questionCount",
    value: string | number
  ) => void;
  onStartQuiz: () => void;
  onBack: () => void;
}

export interface AudioQuizResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export interface BrowserCompatibilityProps {
  onBackToMenu: () => void;
}
