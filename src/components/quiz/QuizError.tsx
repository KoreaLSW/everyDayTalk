interface QuizErrorProps {
  onRetry: () => void;
  onBackToSettings: () => void;
}

export default function QuizError({
  onRetry,
  onBackToSettings,
}: QuizErrorProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-red-500">
        퀴즈 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-[#FFB7C5] text-white rounded-lg"
        onClick={onRetry}
      >
        다시 시도
      </button>
      <button
        className="mt-2 text-gray-500 hover:underline"
        onClick={onBackToSettings}
      >
        레벨 선택으로 돌아가기
      </button>
    </div>
  );
}
