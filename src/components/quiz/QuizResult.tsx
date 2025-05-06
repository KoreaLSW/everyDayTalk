import { useRouter } from "next/navigation";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export default function QuizResult({
  score,
  totalQuestions,
  onRestart,
}: QuizResultProps) {
  const router = useRouter();
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">퀴즈 결과</h1>
        <p className="text-gray-600">
          {totalQuestions}문제 중 {score}문제 정답!
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="text-4xl font-bold mb-4">{percentage}%</div>

        <div className="mb-6">
          {score === totalQuestions ? (
            <p className="text-green-600">완벽해요! 모든 문제를 맞혔습니다!</p>
          ) : score >= totalQuestions * 0.8 ? (
            <p className="text-blue-600">
              훌륭해요! 대부분의 문제를 맞혔습니다!
            </p>
          ) : score >= totalQuestions * 0.6 ? (
            <p className="text-yellow-600">좋아요! 많은 문제를 맞혔습니다.</p>
          ) : (
            <p className="text-red-600">
              조금 더 연습이 필요해요. 다시 도전해보세요!
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="py-3 px-6 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
            onClick={onRestart}
          >
            다시 풀기
          </button>

          <button
            className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => router.push("/quiz")}
          >
            퀴즈 메뉴로
          </button>
        </div>
      </div>
    </div>
  );
}
