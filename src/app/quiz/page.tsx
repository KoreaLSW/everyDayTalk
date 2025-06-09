"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Book,
  PenBox,
  Headphones,
  Trophy,
  Clock,
  Target,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuizType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const quizTypes: QuizType[] = [
  {
    id: "word-meaning",
    name: "단어 의미 맞추기",
    description: "일본어 단어를 보고 알맞은 뜻을 고르세요",
    icon: <Book className="w-6 h-6" />,
  },
  {
    id: "meaning-word",
    name: "단어 맞추기",
    description: "한국어 뜻을 보고 알맞은 일본어 단어를 고르세요",
    icon: <PenBox className="w-6 h-6" />,
  },
  {
    id: "reading",
    name: "읽기 맞추기",
    description: "한자를 보고 알맞은 읽는 방법을 고르세요",
    icon: <Headphones className="w-6 h-6" />,
  },
  {
    id: "audio-quiz",
    name: "소리 듣고 맞추기",
    description: "일본어 발음을 듣고 올바른 단어를 선택하세요",
    icon: <Volume2 className="w-6 h-6" />,
  },
  {
    id: "time-attack",
    name: "타임어택",
    description: "제한시간 내에 최대한 많은 문제를 풀어보세요",
    icon: <Clock className="w-6 h-6" />,
    comingSoon: true,
  },
  {
    id: "daily-challenge",
    name: "오늘의 도전",
    description: "매일 새로운 퀴즈로 실력을 테스트해보세요",
    icon: <Target className="w-6 h-6" />,
    comingSoon: true,
  },
  {
    id: "ranking-battle",
    name: "랭킹 배틀",
    description: "다른 사용자들과 점수를 겨뤄보세요",
    icon: <Trophy className="w-6 h-6" />,
    comingSoon: true,
  },
];

export default function QuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const router = useRouter();

  const handleStartQuiz = () => {
    if (!selectedQuiz) return;

    switch (selectedQuiz) {
      case "word-meaning":
        router.push("/quiz/word-meaning");
        break;
      case "meaning-word":
        router.push("/quiz/meaning-word");
        break;
      case "reading":
        router.push("/quiz/reading");
        break;
      case "audio-quiz":
        router.push("/quiz/audio-quiz");
        break;
      default:
        console.log("Invalid quiz type selected");
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">퀴즈 챌린지</h1>
          <p className="text-gray-600">
            다양한 유형의 퀴즈로 일본어 실력을 테스트해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizTypes.map((quiz) => (
            <div
              key={quiz.id}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200
                ${
                  selectedQuiz === quiz.id
                    ? "border-[#FFB7C5] bg-pink-50"
                    : "border-gray-200 hover:border-[#FFB7C5] hover:shadow-md"
                }
                ${
                  quiz.comingSoon
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
              onClick={() => {
                if (!quiz.comingSoon) {
                  setSelectedQuiz(quiz.id);
                }
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`p-2 rounded-full
                    ${
                      selectedQuiz === quiz.id
                        ? "bg-[#FFB7C5] text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {quiz.icon}
                </div>
                <h3 className="text-lg font-semibold">{quiz.name}</h3>
              </div>
              <p className="text-gray-600">{quiz.description}</p>
              {quiz.comingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-gray-400 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedQuiz && (
          <div className="mt-8 flex justify-center">
            <button
              className="px-6 py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
              onClick={handleStartQuiz}
            >
              퀴즈 시작하기
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
