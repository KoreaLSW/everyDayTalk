import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { AudioQuizProgressProps } from "./types";
import AudioControls from "./AudioControls";
import QuestionOptions from "./QuestionOptions";

export default function AudioQuizProgress({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  score,
  options,
  selectedAnswer,
  showResult,
  settings,
  isPlaying,
  canSpeak,
  onAnswerSelect,
  onNextQuestion,
  onRestart,
  onSpeak,
  onStopSpeaking,
}: AudioQuizProgressProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 헤더 및 진행 상황 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">소리 듣고 맞추기</h1>
        <p className="text-gray-600">
          일본어 발음을 듣고 올바른 단어를 선택하세요
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            점수 {score} / {currentQuestionIndex + (showResult ? 1 : 0)}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
            레벨 {settings.level}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 음성 재생 섹션 */}
        <AudioControls
          currentQuestion={currentQuestion}
          isPlaying={isPlaying}
          canSpeak={canSpeak}
          onSpeak={onSpeak}
          onStop={onStopSpeaking}
        />

        {/* 선택지 */}
        <QuestionOptions
          options={options}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onAnswerSelect={onAnswerSelect}
        />

        {/* 결과 및 다음 버튼 */}
        {showResult && (
          <div className="text-center">
            <div className="mb-4">
              {options[selectedAnswer!]?.isCorrect ? (
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">정답입니다! 🎉</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-lg font-semibold">틀렸습니다 😅</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={onNextQuestion}
                className="px-6 py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
              >
                {currentQuestionIndex < totalQuestions - 1
                  ? "다음 문제"
                  : "결과 보기"}
              </button>
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                처음부터 다시
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
