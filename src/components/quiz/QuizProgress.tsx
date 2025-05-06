interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
}

export default function QuizProgress({
  currentIndex,
  totalQuestions,
}: QuizProgressProps) {
  return (
    <div className="mb-8">
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-[#FFB7C5] rounded-full"
          style={{
            width: `${(currentIndex / totalQuestions) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
