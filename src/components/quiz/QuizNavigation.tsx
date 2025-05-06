import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onBackToSettings: () => void;
}

export default function QuizNavigation({
  currentIndex,
  totalQuestions,
  onBackToSettings,
}: QuizNavigationProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mb-6">
      <button
        className="flex items-center text-gray-600 hover:text-gray-900"
        onClick={() => router.push("/quiz")}
      >
        <ChevronLeft size={20} />
        <span className="ml-1">퀴즈 메뉴</span>
      </button>

      <div className="text-gray-600">
        {currentIndex + 1} / {totalQuestions}
      </div>

      <button
        className="text-sm text-gray-500 hover:underline ml-4"
        onClick={onBackToSettings}
      >
        레벨 다시 선택하기
      </button>
    </div>
  );
}
