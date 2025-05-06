interface NextQuestionButtonProps {
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export default function NextQuestionButton({
  onNextQuestion,
  isLastQuestion,
}: NextQuestionButtonProps) {
  return (
    <div className="flex justify-center">
      <button
        className="py-3 px-6 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
        onClick={onNextQuestion}
      >
        {isLastQuestion ? "결과 보기" : "다음 문제"}
      </button>
    </div>
  );
}
