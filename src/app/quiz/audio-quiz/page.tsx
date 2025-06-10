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
  AudioQuizData,
  QuizOption,
  QuizSettings,
  QuizState,
} from "@/components/quiz/audio";
import {
  useQuizData,
  useUpdateWordProgress,
  Question,
  Option,
} from "@/hooks/useQuizData";

export default function AudioQuizPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // 퀴즈 상태 관리
  const [quizState, setQuizState] = useState<QuizState>(QuizState.SETTINGS);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    level: "N5",
    questionCount: 10,
  });

  // 퀴즈 데이터 관리
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // DB에서 데이터 로드 (useQuizData 훅 사용)
  const [shouldFetch, setShouldFetch] = useState(false);
  const { questions, isLoading, isError, loadNewQuiz } = useQuizData(
    "audio-quiz", // 퀴즈 타입
    session?.user?.id,
    quizSettings,
    shouldFetch
  );

  const { updateProgress } = useUpdateWordProgress();

  // 로딩 및 오디오 상태
  const [canSpeak, setCanSpeak] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // 실시간 상태 추적을 위한 ref
  const isPlayingRef = useRef(false);

  // isPlaying 상태와 ref 동기화
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    console.log(
      `🔄 상태 동기화: isPlaying=${isPlaying}, ref=${isPlayingRef.current}`
    );
  }, [isPlaying]);

  // TTS 지원 확인
  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);

    if ("speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log(
          "사용 가능한 음성:",
          voices.map((v) => `${v.name} (${v.lang})`)
        );

        // 음성 목록이 로드되었는지 확인
        if (voices.length > 0) {
          setVoicesLoaded(true);
          console.log("✅ 음성 목록 로드 완료:", voices.length + "개");

          // 음성 엔진 워밍업 (첫 재생 안정성 향상)
          setTimeout(() => {
            console.log("🔥 음성 엔진 워밍업 시작");
            const warmupUtterance = new SpeechSynthesisUtterance("");
            warmupUtterance.volume = 0; // 무음으로 실행
            speechSynthesis.speak(warmupUtterance);
            speechSynthesis.cancel();
            console.log("✅ 음성 엔진 워밍업 완료");
          }, 100);
        }
      };

      // 즉시 한 번 실행
      loadVoices();

      // 음성 목록이 아직 비어있다면 이벤트 리스너 등록
      if (speechSynthesis.getVoices().length === 0) {
        console.log("⏳ 음성 목록 로딩 중... 이벤트 리스너 등록");
        speechSynthesis.addEventListener("voiceschanged", loadVoices);

        // 강제로 음성 목록 로드 시도 (일부 브라우저에서 필요)
        const utterance = new SpeechSynthesisUtterance("");
        speechSynthesis.speak(utterance);
        speechSynthesis.cancel();
      } else {
        setVoicesLoaded(true);

        // 즉시 워밍업 실행
        setTimeout(() => {
          console.log("🔥 즉시 음성 엔진 워밍업 시작");
          const warmupUtterance = new SpeechSynthesisUtterance("");
          warmupUtterance.volume = 0;
          speechSynthesis.speak(warmupUtterance);
          speechSynthesis.cancel();
          console.log("✅ 즉시 음성 엔진 워밍업 완료");
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
        console.log("🔴 컴포넌트 언마운트 시 음성 정리");
        speechSynthesis.cancel();
      }
    };
  }, []);

  // 컴포넌트 마운트 시 항상 레벨 선택 화면으로 시작
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

    // 답안 선택 시 오디오 자동 중지
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

    // 선택 후 진행 상황 업데이트
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
    // 혹시 오디오가 재생 중이라면 중지
    if (isPlaying) {
      stopSpeaking();
    }

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
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

  // 일본어 음성 재생 함수
  const speakJapanese = async (text: string, speed: number = 0.8) => {
    if (!canSpeak || isPlayingRef.current) {
      return;
    }

    // 음성 목록이 로드되지 않았다면 잠시 기다렸다가 재시도
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

    // 첫 재생 전 추가 워밍업 (더 안정적인 재생을 위해)
    try {
      console.log("🔥 재생 직전 워밍업 시작");
      const quickWarmup = new SpeechSynthesisUtterance("");
      quickWarmup.volume = 0;
      speechSynthesis.speak(quickWarmup);
      speechSynthesis.cancel();

      // 짧은 지연 후 실제 재생
      setTimeout(() => {
        startSpeaking(text, speed);
      }, 50);
    } catch (error) {
      console.warn("⚠️ 워밍업 실패, 바로 재생 시도:", error);
      startSpeaking(text, speed);
    }
  };

  // 음성 엔진 재시작 함수
  const restartSpeechSynthesis = () => {
    console.log("🔄 음성 엔진 재시작 시도...");

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // 음성 엔진 강제 재초기화
    setTimeout(() => {
      const voices = speechSynthesis.getVoices();
      console.log("🔄 재시작 후 사용 가능한 음성:", voices.length);

      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log("✅ 음성 엔진 재시작 완료");
      }
    }, 200);
  };

  // 실제 음성 재생 함수
  const startSpeaking = (text: string, speed: number = 0.8) => {
    console.log("🎤 startSpeaking 시작:", text, "속도:", speed);

    // 음성 엔진 상태 체크
    console.log("🔍 음성 엔진 상태:", {
      speechSynthesis: !!window.speechSynthesis,
      speaking: speechSynthesis.speaking,
      pending: speechSynthesis.pending,
      paused: speechSynthesis.paused,
      voicesLength: speechSynthesis.getVoices().length,
      voicesLoaded,
    });

    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();

    const japaneseVoice = voices.find(
      (voice) => voice.lang.startsWith("ja") || voice.lang === "ja-JP"
    );

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
      console.log(
        "✅ 사용된 음성:",
        japaneseVoice.name,
        "언어:",
        japaneseVoice.lang
      );
    } else {
      console.warn(
        "⚠️ 일본어 음성을 찾을 수 없습니다. 기본 음성을 사용합니다."
      );
      console.log(
        "🎵 사용 가능한 모든 음성:",
        voices.map((v) => `${v.name} (${v.lang})`)
      );
    }

    utterance.lang = "ja-JP";
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    // TTS 설정 상세 로깅
    console.log("🎵 TTS 상세 설정:", {
      text: utterance.text,
      lang: utterance.lang,
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      voice: utterance.voice?.name || "기본 음성",
      voiceLang: utterance.voice?.lang || "알 수 없음",
    });

    // 시스템 오디오 상태 체크
    console.log("🔊 시스템 오디오 상태:", {
      documentHidden: document.hidden,
      documentVisibility: document.visibilityState,
      windowFocused: document.hasFocus(),
      userAgent: navigator.userAgent.includes("Chrome")
        ? "Chrome"
        : navigator.userAgent.includes("Safari")
        ? "Safari"
        : navigator.userAgent.includes("Firefox")
        ? "Firefox"
        : "기타",
    });

    const handlePlayingEnd = () => {
      console.log("🔴 handlePlayingEnd 호출됨!");
      console.log(
        `🔍 현재 상태: isPlaying=${isPlaying}, ref=${isPlayingRef.current}`
      );

      setIsPlaying(false);
      isPlayingRef.current = false;

      console.log("🔴 isPlaying과 ref를 false로 설정");
    };

    let endTimer: NodeJS.Timeout;
    let checkTimer: NodeJS.Timeout;
    let forceStopTimer: NodeJS.Timeout;
    let hasStarted = false;
    let firstPlayFailed = false;

    utterance.onstart = () => {
      console.log("🟢 onstart 이벤트 - 음성 재생 시작:", text);
      hasStarted = true;

      const baseTime = text.length * 150;
      const speedAdjusted = baseTime / speed;
      const estimatedDuration = Math.max(1000, Math.min(speedAdjusted, 8000));

      console.log(`⏱️ 예상 재생 시간: ${estimatedDuration}ms`);

      // 1. 예상 시간 기반 타이머
      endTimer = setTimeout(() => {
        console.log("⏰ 예상 시간 경과 - 상태 확인 중...");
        if (speechSynthesis.speaking) {
          console.log("🔄 아직 재생 중이므로 중단 실행");
          speechSynthesis.cancel();
        } else {
          console.log("🔄 이미 재생 완료됨 - 상태 정리");
          handlePlayingEnd();
        }
      }, estimatedDuration + 500);

      // 2. 강제 중지 타이머 (최대 10초)
      forceStopTimer = setTimeout(() => {
        console.log("🚨 10초 강제 중지 타이머 실행");
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
        }
        handlePlayingEnd();
        clearTimeout(endTimer);
        clearInterval(checkTimer);
      }, 10000);

      // 3. 주기적 상태 체크
      const startCheckTime = Date.now();
      checkTimer = setInterval(() => {
        const elapsed = Date.now() - startCheckTime;
        const stillSpeaking = speechSynthesis.speaking;
        const currentlyPlaying = isPlayingRef.current;

        console.log(
          `🔍 상태 체크 (${elapsed}ms): speaking=${stillSpeaking}, isPlaying=${isPlaying}, ref=${currentlyPlaying}`
        );

        if (!stillSpeaking && currentlyPlaying) {
          console.log("✅ 재생 완료 감지 - 정리 시작");
          clearTimeout(endTimer);
          clearTimeout(forceStopTimer);
          clearInterval(checkTimer);
          handlePlayingEnd();
          return;
        }

        if (elapsed > 12000) {
          console.warn("🚨 12초 초과 - 응급 강제 중지");
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
          clearTimeout(endTimer);
          clearTimeout(forceStopTimer);
          clearInterval(checkTimer);
          handlePlayingEnd();
        }
      }, 200); // 200ms마다 체크
    };

    utterance.onend = () => {
      console.log("🏁 onend 이벤트 발생");
      clearTimeout(endTimer);
      clearTimeout(forceStopTimer);
      clearInterval(checkTimer);
      handlePlayingEnd();
    };

    utterance.onerror = (event) => {
      console.error("❌ onerror 이벤트:", event.error);
      clearTimeout(endTimer);
      clearTimeout(forceStopTimer);
      clearInterval(checkTimer);

      // 첫 번째 재생 실패이고, interrupted가 아닌 경우 재시도
      if (!firstPlayFailed && event.error !== "interrupted" && !hasStarted) {
        console.log("🔄 첫 재생 실패 감지 - 1초 후 자동 재시도");
        firstPlayFailed = true;
        handlePlayingEnd();

        setTimeout(() => {
          console.log("🔄 자동 재시도 실행");
          startSpeaking(text, speed);
        }, 1000);
        return;
      }

      handlePlayingEnd();

      if (event.error !== "interrupted") {
        console.error(`음성 재생 오류: ${event.error}`);
        if (event.error !== "network" && event.error !== "synthesis-failed") {
          alert(
            `음성 재생 중 오류가 발생했습니다: ${event.error}\n다른 브라우저를 시도해보세요.`
          );
        }
      } else {
        console.log("ℹ️ 음성이 중단되었습니다 (일반적인 현상)");
      }
    };

    utterance.onboundary = (event) => {
      if (event.name === "sentence" || event.name === "word") {
        console.log(`📍 경계 이벤트: ${event.name} at ${event.elapsedTime}ms`);
      }
    };

    utterance.onpause = () => {
      console.log("⏸️ onpause 이벤트");
    };

    utterance.onresume = () => {
      console.log("▶️ onresume 이벤트");
    };

    try {
      console.log("🚀 speechSynthesis.speak 호출");
      speechSynthesis.speak(utterance);

      // 강력한 안전장치 1: speak 호출 후 상태 재확인
      setTimeout(() => {
        console.log("🔍 500ms 후 상태 체크:", {
          speaking: speechSynthesis.speaking,
          isPlaying: isPlayingRef.current,
          hasStarted,
        });

        if (!speechSynthesis.speaking && isPlayingRef.current && !hasStarted) {
          console.warn("⚠️ speak 호출 후 500ms 내에 재생이 시작되지 않음");

          // 첫 번째 시도라면 재시도
          if (!firstPlayFailed) {
            console.log("🔄 첫 재생 실패로 판단 - 더 강력한 재시도");
            firstPlayFailed = true;
            handlePlayingEnd();

            // 음성 엔진 완전 리셋 후 재시도
            setTimeout(() => {
              if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
              }

              // 추가 워밍업
              try {
                const retryWarmup = new SpeechSynthesisUtterance("");
                retryWarmup.volume = 0;
                speechSynthesis.speak(retryWarmup);
                speechSynthesis.cancel();
              } catch (e) {
                console.warn("재시도 워밍업 실패:", e);
              }

              setTimeout(() => {
                console.log("🔄 500ms 체크 후 강화된 자동 재시도 실행");
                startSpeaking(text, speed);
              }, 200);
            }, 800);
            return;
          } else {
            console.warn("⚠️ 재시도도 실패 - 즉시 중지");
            handlePlayingEnd();
          }
        }
      }, 500);

      // 강력한 안전장치 2: onstart가 호출되지 않는 경우 대비
      setTimeout(() => {
        console.log("🔍 3초 후 onstart 이벤트 체크:", {
          speaking: speechSynthesis.speaking,
          isPlaying: isPlayingRef.current,
          hasStarted,
        });

        if (isPlayingRef.current && !hasStarted) {
          console.warn("🚨 onstart 이벤트가 3초 내에 발생하지 않음");

          // 아직 speaking 상태라면 잠시 더 기다리기
          if (speechSynthesis.speaking) {
            console.log("🔄 아직 speaking 중이므로 잠시 더 대기");
          } else {
            console.warn("🚨 speaking도 중지됨 - 강제 중지");
            handlePlayingEnd();
          }
        }
      }, 3000);

      // 강력한 안전장치 3: 최대 20초 후 무조건 중지
      setTimeout(() => {
        if (isPlayingRef.current) {
          console.warn("🚨 20초 최대 타이머 - 무조건 중지");
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
          handlePlayingEnd();
        }
      }, 20000);
    } catch (error) {
      console.error("💥 speechSynthesis.speak 오류:", error);
      handlePlayingEnd();
      alert("음성 재생에 실패했습니다. 브라우저를 새로고침해보세요.");
    }
  };

  // 음성 중지 함수
  const stopSpeaking = () => {
    console.log("🛑 stopSpeaking 호출됨");

    if ("speechSynthesis" in window) {
      const wasSpeaking = speechSynthesis.speaking;
      const wasPlaying = isPlayingRef.current;
      console.log("🔍 중지 전 상태:", { wasSpeaking, isPlaying, wasPlaying });

      speechSynthesis.cancel();
      setIsPlaying(false);
      isPlayingRef.current = false;

      console.log("🔴 사용자가 음성 재생을 중지했습니다.");
      console.log("🔴 isPlaying과 ref를 false로 강제 설정");

      // 추가 안전장치: 약간의 지연 후 상태 재확인
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          console.warn("⚠️ cancel 후에도 아직 재생 중 - 재시도");
          speechSynthesis.cancel();
        }
        if (isPlayingRef.current) {
          console.warn("⚠️ ref가 아직 true - 강제 false 설정");
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
      }, 100);
    }
  };

  // 렌더링 로직
  return (
    <ProtectedRoute>
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
          />
        )}
    </ProtectedRoute>
  );
}
