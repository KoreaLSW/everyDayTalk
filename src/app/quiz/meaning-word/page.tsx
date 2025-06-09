"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useQuizData,
  useUpdateWordProgress,
  Option,
} from "@/hooks/useQuizData";
import { QuizState } from "@/components/quiz/types";

// 컴포넌트 import
import QuizSettings from "@/components/quiz/QuizSettings";
import QuizLoading from "@/components/quiz/QuizLoading";
import QuizError from "@/components/quiz/QuizError";
import QuizNavigation from "@/components/quiz/QuizNavigation";
import QuizProgress from "@/components/quiz/QuizProgress";
import MeaningWordQuizQuestion from "@/components/quiz/MeaningWordQuizQuestion";
import NextQuestionButton from "@/components/quiz/NextQuestionButton";
import QuizResult from "@/components/quiz/QuizResult";

export default function MeaningWordQuizPage() {
  const { data: session } = useSession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizSettings, setQuizSettings] = useState({
    level: "N5",
    questionCount: 10,
  });

  // enum 기반 퀴즈 상태 관리
  const [quizState, setQuizState] = useState<QuizState>(QuizState.SETTINGS);

  // 처음에는 데이터를 가져오지 않음 (레벨 선택 화면에서는 API 호출 X)
  const [shouldFetch, setShouldFetch] = useState(false);
  // SWR hook 사용
  const { questions, isLoading, isError, loadNewQuiz } = useQuizData(
    "meaning-word", // 퀴즈 타입 변경
    session?.user?.id,
    quizSettings,
    shouldFetch
  );
  console.log("옵션 구조:", questions);

  const { updateProgress } = useUpdateWordProgress();

  // 로컬 스토리지 키
  const storageKey = "quizMeaningWord";

  // 컴포넌트 마운트 시 항상 레벨 선택 화면으로 시작
  useEffect(() => {
    setQuizState(QuizState.SETTINGS);
    setShouldFetch(false);

    try {
      const savedSettings = localStorage.getItem(`${storageKey}_settings`);
      if (savedSettings) {
        setQuizSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error restoring quiz settings:", error);
    }
  }, []);

  // 설정 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(
      `${storageKey}_settings`,
      JSON.stringify(quizSettings)
    );
  }, [quizSettings]);

  // 페이지 로드 시 데이터 새로고침
  useEffect(() => {
    setShouldFetch(true);
    loadNewQuiz();
  }, []);

  // 옵션 선택 처리
  const handleOptionSelect = (option: Option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option.isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // 선택 후 진행 상황 업데이트
    if (session?.user?.id && questions[currentQuestionIndex]) {
      updateProgress(
        session.user.id,
        questions[currentQuestionIndex].wordInfo.word_id,
        option.isCorrect
      );
    }
  };

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizState(QuizState.RESULT);
    }
  };

  // 퀴즈 재시작
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizState(QuizState.SETTINGS);
    setShouldFetch(false);
  };

  // 퀴즈 설정 변경
  const handleSettingsChange = (
    setting: "level" | "questionCount",
    value: string | number
  ) => {
    setQuizSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // 퀴즈 시작
  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setShouldFetch(true);
    setQuizState(QuizState.PROGRESS);
    loadNewQuiz();
  };

  return (
    <ProtectedRoute>
      {quizState === QuizState.SETTINGS && (
        <QuizSettings
          quizName="뜻으로 단어 맞추기"
          settings={quizSettings}
          onSettingsChange={handleSettingsChange}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {quizState === QuizState.PROGRESS && isLoading && <QuizLoading />}

      {quizState === QuizState.PROGRESS && isError && (
        <QuizError
          onRetry={() => {
            setShouldFetch(true);
            loadNewQuiz();
          }}
          onBackToSettings={() => setQuizState(QuizState.SETTINGS)}
        />
      )}

      {quizState === QuizState.PROGRESS &&
        !isLoading &&
        !isError &&
        questions.length === 0 && (
          <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-gray-600">
              문제를 불러올 수 없습니다. 다시 시도해주세요.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-[#FFB7C5] text-white rounded-lg"
              onClick={() => setQuizState(QuizState.SETTINGS)}
            >
              레벨 선택으로 돌아가기
            </button>
          </div>
        )}

      {quizState === QuizState.PROGRESS &&
        !isLoading &&
        !isError &&
        questions.length > 0 && (
          <div className="p-8 max-w-4xl mx-auto">
            <QuizNavigation
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onBackToSettings={() => setQuizState(QuizState.SETTINGS)}
            />

            <QuizProgress
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />

            <MeaningWordQuizQuestion
              question={questions[currentQuestionIndex]}
              selectedOption={selectedOption}
              isAnswered={isAnswered}
              onSelectOption={handleOptionSelect}
            />

            {isAnswered && (
              <NextQuestionButton
                onNextQuestion={handleNextQuestion}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
              />
            )}
          </div>
        )}

      {quizState === QuizState.RESULT && (
        <QuizResult
          score={score}
          totalQuestions={questions.length}
          onRestart={handleRestart}
        />
      )}
    </ProtectedRoute>
  );
}
