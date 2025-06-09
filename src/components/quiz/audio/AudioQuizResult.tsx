import { AudioQuizResultProps } from "./types";

export default function AudioQuizResult({
  score,
  totalQuestions,
  onRestart,
  onBackToMenu,
}: AudioQuizResultProps) {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">퀴즈 완료! 🎉</h1>

        <div className="mb-6">
          <div className="text-6xl font-bold text-[#FFB7C5] mb-2">
            {score}/{totalQuestions}
          </div>
          <div className="text-2xl text-gray-600">정답률: {percentage}%</div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
          >
            다시 시작
          </button>
          <button
            onClick={onBackToMenu}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            퀴즈 메뉴로
          </button>
        </div>
      </div>
    </div>
  );
}
