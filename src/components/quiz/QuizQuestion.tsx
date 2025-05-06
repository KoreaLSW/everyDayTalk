import { CheckCircle, XCircle } from "lucide-react";
import { Question, Option } from "@/hooks/useQuizData";

interface QuizQuestionProps {
  question: Question;
  selectedOption: Option | null;
  isAnswered: boolean;
  onSelectOption: (option: Option) => void;
}

export default function QuizQuestion({
  question,
  selectedOption,
  isAnswered,
  onSelectOption,
}: QuizQuestionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">
        다음 단어의 의미는 무엇인가요?
      </h2>

      <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold mb-2">{question.wordInfo.word}</div>
        <div className="text-gray-600">{question.wordInfo.reading}</div>
        <div className="mt-2 text-xs px-2 py-1 bg-[#FFB7C5] text-white rounded-full">
          {question.wordInfo.level}
        </div>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-lg text-left transition-colors ${
              selectedOption === option
                ? option.isCorrect
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-red-100 border-2 border-red-500"
                : "bg-gray-100 hover:bg-gray-200 border-2 border-transparent"
            } ${
              isAnswered && option.isCorrect
                ? "bg-green-100 border-2 border-green-500"
                : ""
            }`}
            onClick={() => onSelectOption(option)}
            disabled={isAnswered}
          >
            <div className="flex items-center">
              <span className="flex-1">{option.text}</span>
              {isAnswered &&
                (option.isCorrect ? (
                  <CheckCircle className="text-green-500" />
                ) : selectedOption === option ? (
                  <XCircle className="text-red-500" />
                ) : null)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
