import { CheckCircle, XCircle } from "lucide-react";
import { QuestionOptionsProps } from "./types";

export default function KanjiQuestionOptions({
  options,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: QuestionOptionsProps) {
  console.log('options~!', options);
  console.log('🎈🎈🎈showResult~!', showResult);
  console.log('🎈🎈🎈showResult~!', showResult);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onAnswerSelect(index)}
          disabled={showResult}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedAnswer === index
              ? showResult
                ? option.isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
                : "border-[#FFB7C5] bg-pink-50"
              : showResult && option.isCorrect
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-[#FFB7C5] hover:bg-pink-50"
          } ${showResult ? "cursor-default" : "cursor-pointer"}`}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="font-medium text-lg">
                <span className="text-xl">{option.word}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({option.reading})
                </span>
              </div>
              {showResult && selectedAnswer === index && (
                <div className="ml-2">
                  {option.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              )}
              {showResult && option.isCorrect && selectedAnswer !== index && (
                <div className="ml-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}
            </div>
            {showResult && (
              <div className="mt-2 text-sm text-gray-600">
                의미: {option.meaning}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
} 