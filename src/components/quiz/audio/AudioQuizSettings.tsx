import { ChevronLeft } from "lucide-react";
import { AudioQuizSettingsProps } from "./types";

export default function AudioQuizSettings({
  settings,
  onSettingsChange,
  onStartQuiz,
  onBack,
}: AudioQuizSettingsProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">소리 듣고 맞추기</h1>
        <p className="text-gray-600">퀴즈 설정을 선택해주세요</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">단어 레벨:</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.level}
            onChange={(e) => onSettingsChange("level", e.target.value)}
          >
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">문제 수:</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.questionCount}
            onChange={(e) =>
              onSettingsChange("questionCount", Number(e.target.value))
            }
          >
            <option value="5">5개</option>
            <option value="10">10개</option>
            <option value="20">20개</option>
            <option value="30">30개</option>
          </select>
        </div>

        <button
          className="w-full py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
          onClick={onStartQuiz}
        >
          퀴즈 시작하기
        </button>
      </div>

      <button
        className="mt-6 flex items-center text-gray-600 hover:text-gray-900"
        onClick={onBack}
      >
        <ChevronLeft size={20} />
        <span className="ml-1">퀴즈 메뉴로 돌아가기</span>
      </button>
    </div>
  );
}
