"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  AudioQuizSettings,
  AudioQuizResult,
  AudioQuizProgress,
  BrowserCompatibility,
  LoadingSpinner,
} from "@/components/quiz/audio";
import {
  useQuizData,
  useUpdateWordProgress,
  Question,
  Option,
} from "@/hooks/useQuizData";
import { QuizState } from "@/components/quiz/audio/types";
import KanjiQuestionOptions from "@/components/quiz/audio/KanjiQuestionOptions";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default function KanjiListeningQuizPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // 퀴즈 상태 관리
  const [quizState, setQuizState] = useState<QuizState>(QuizState.SETTINGS);
  const [quizSettings, setQuizSettings] = useState({
    level: "N5",
    questionCount: 10,
  });

  // 퀴즈 데이터 관리
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // DB에서 데이터 로드
  const [shouldFetch, setShouldFetch] = useState(false);
  const { questions, isLoading, isError, loadNewQuiz } = useQuizData(
    "listening-kanji",
    session?.user?.id,
    quizSettings,
    shouldFetch,
    true // 한자 옵션 사용
  );
  console.log('🎈🎈🎈!!!questions~!', questions);
  const { updateProgress } = useUpdateWordProgress();

  // 오디오 상태 관리
  const [canSpeak, setCanSpeak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const isPlayingRef = useRef(false);

  // TTS 관련 설정
  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
          setTimeout(() => {
            const warmupUtterance = new SpeechSynthesisUtterance("");
            warmupUtterance.volume = 0;
            speechSynthesis.speak(warmupUtterance);
            speechSynthesis.cancel();
          }, 100);
        }
      };

      loadVoices();

      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener("voiceschanged", loadVoices);
        const utterance = new SpeechSynthesisUtterance("");
        speechSynthesis.speak(utterance);
        speechSynthesis.cancel();
      } else {
        setVoicesLoaded(true);
        setTimeout(() => {
          const warmupUtterance = new SpeechSynthesisUtterance("");
          warmupUtterance.volume = 0;
          speechSynthesis.speak(warmupUtterance);
          speechSynthesis.cancel();
        }, 100);
      }

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  // 컴포넌트 언마운트 시 음성 정리
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // isPlaying 상태와 ref 동기화
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 컴포넌트 마운트 시 설정 화면으로 시작
  useEffect(() => {
    setQuizState(QuizState.SETTINGS);
    setShouldFetch(false);
  }, []);

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
    setSelectedAnswer(null);
    setShowResult(false);
    setShouldFetch(true);
    setQuizState(QuizState.PROGRESS);
    loadNewQuiz();
  };

  // 답안 선택 처리
  const handleAnswerSelect = (optionIndex: number) => {
    if (showResult || !questions[currentQuestionIndex]) return;

    if (isPlaying) {
      stopSpeaking();
    }

    setSelectedAnswer(optionIndex);
    setShowResult(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[optionIndex].isCorrect;

    if (isCorrect) {
      setScore(score + 1);
    }

    if (session?.user?.id) {
      updateProgress(
        session.user.id,
        currentQuestion.wordInfo.word_id,
        isCorrect
      );
    }
  };

  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (isPlaying) {
      stopSpeaking();
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizState(QuizState.RESULT);
    }
  };

  // 퀴즈 재시작
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizState(QuizState.SETTINGS);
    setShouldFetch(false);
  };

  // 메뉴로 돌아가기
  const handleBackToMenu = () => {
    router.push("/quiz");
  };

  // 일본어 음성 재생
  const speakJapanese = async (text: string, speed: number = 0.8) => {
    if (!canSpeak || isPlayingRef.current) return;

    if (!voicesLoaded) {
      setTimeout(() => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          setVoicesLoaded(true);
          speakJapanese(text, speed);
        } else {
          startSpeaking(text, speed);
        }
      }, 300);
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setTimeout(() => startSpeaking(text, speed), 150);
      return;
    }

    startSpeaking(text, speed);
  };

  // 실제 음성 재생
  const startSpeaking = (text: string, speed: number = 0.8) => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(
      (voice) => voice.lang.startsWith("ja") || voice.lang === "ja-JP"
    );

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    utterance.lang = "ja-JP";
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    const handlePlayingEnd = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    utterance.onend = handlePlayingEnd;
    utterance.onerror = (event) => {
      handlePlayingEnd();
      if (event.error !== "interrupted") {
        console.error(`음성 재생 오류: ${event.error}`);
      }
    };

    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("음성 재생 실패:", error);
      handlePlayingEnd();
    }
  };

  // 음성 중지
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-y-auto">
        {/* 설정 화면 */}
        {quizState === QuizState.SETTINGS && (
          <AudioQuizSettings
            settings={quizSettings}
            onSettingsChange={handleSettingsChange}
            onStartQuiz={handleStartQuiz}
            onBack={handleBackToMenu}
          />
        )}

        {/* 결과 화면 */}
        {quizState === QuizState.RESULT && (
          <AudioQuizResult
            score={score}
            totalQuestions={questions.length}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
          />
        )}

        {/* 로딩 화면 */}
        {quizState === QuizState.PROGRESS && isLoading && <LoadingSpinner />}

        {/* 에러 화면 */}
        {quizState === QuizState.PROGRESS && isError && (
          <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-red-600 mb-4">
              문제를 불러오는데 실패했습니다. 다시 시도해주세요.
            </p>
            <button
              className="px-4 py-2 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
              onClick={() => {
                setShouldFetch(true);
                loadNewQuiz();
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 문제 없음 화면 */}
        {quizState === QuizState.PROGRESS &&
          !isLoading &&
          !isError &&
          questions.length === 0 && (
            <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
              <p className="text-gray-600 mb-4">
                문제를 불러올 수 없습니다. 다시 시도해주세요.
              </p>
              <button
                className="px-4 py-2 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
                onClick={() => setQuizState(QuizState.SETTINGS)}
              >
                레벨 선택으로 돌아가기
              </button>
            </div>
          )}

        {/* 브라우저 호환성 체크 */}
        {quizState === QuizState.PROGRESS &&
          !isLoading &&
          !isError &&
          questions.length > 0 &&
          !canSpeak && <BrowserCompatibility onBackToMenu={handleBackToMenu} />}

        {/* 퀴즈 진행 화면 */}
        {quizState === QuizState.PROGRESS &&
          !isLoading &&
          !isError &&
          canSpeak &&
          questions.length > 0 && (
            <AudioQuizProgress
              currentQuestion={questions[currentQuestionIndex]}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              score={score}
              options={questions[currentQuestionIndex].options}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              settings={quizSettings}
              isPlaying={isPlaying}
              canSpeak={canSpeak}
              onAnswerSelect={handleAnswerSelect}
              onNextQuestion={handleNextQuestion}
              onRestart={handleRestart}
              onSpeak={speakJapanese}
              onStopSpeaking={stopSpeaking}
              wordInfo={questions[currentQuestionIndex].wordInfo}
              QuestionOptionsComponent={KanjiQuestionOptions}
              title="소리 듣고 한자 맞추기"
              description="일본어 발음을 듣고 올바른 한자를 선택하세요"
            />
          )}
      </div>
    </ProtectedRoute>
  );
} 