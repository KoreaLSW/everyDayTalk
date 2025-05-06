"use client";

import { ReactNode, useState, useEffect } from "react";
import { WordsProvider } from "../../context/WordsContext";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useWordStats, useSearchWords } from "@/hooks/useWord";
import { WordStat } from "@/types/words";
import { useSearchParams } from "next/navigation";
import { LevelSelector } from "@/components/vocabulary/LevelSelector";
import { WordbookSelector } from "@/components/vocabulary/WordbookSelector";
import { SearchContainer } from "@/components/vocabulary/SearchContainer";
import { SearchSuggestions } from "@/components/vocabulary/SearchSuggestions";

interface WordSuggestion {
  word_id: string;
  word: string;
  reading: string;
  meanings: string[];
  level: string;
}

const levels = ["전체", "N1", "N2", "N3", "N4", "N5"];
const wordbooks = [
  "전체",
  "공부해야 할 단어",
  "외운 단어장",
  "복습이 필요한 단어장",
];

const wordbookMap: Record<
  string,
  "all" | "memorized" | "notMemorized" | "unChecked"
> = {
  전체: "all",
  "공부해야 할 단어": "unChecked",
  "외운 단어장": "memorized",
  "복습이 필요한 단어장": "notMemorized",
};

interface VocabularyLayoutProps {
  children: ReactNode;
}

export default function VocabularyLayoutComponent({
  children,
}: VocabularyLayoutProps) {
  const { data: session } = useSession();
  const { id } = (session && session.user) || {};

  const searchParams = useSearchParams();
  const urlLevel = searchParams.get("level");

  const {
    stats,
    isLoading: isStatsLoading,
    refreshStats,
  } = useWordStats(id || "") as {
    stats: WordStat[] | undefined;
    isLoading: boolean;
    refreshStats: () => Promise<void>;
  };

  const [selectedLevel, setSelectedLevel] = useState(urlLevel || "N1"); // 선택된 JLPT 레벨 (기본값: URL에서 가져오거나 "N1")
  const [selectedWordbook, setSelectedWordbook] = useState("전체"); // 선택된 단어장 유형 (기본값: "전체")
  const [searchTerm, setSearchTerm] = useState(""); // 현재 입력된 검색어
  const [showSuggestions, setShowSuggestions] = useState(false); // 자동완성 제안 표시 여부
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false); // 검색이 제출되었는지 여부
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState(""); // 제출된 검색어 (검색 결과 조회에 사용)
  const [isSearchLoading, setIsSearchLoading] = useState(false); // 검색 로딩 상태

  const { suggestions, isLoading: isSuggestionsLoading } = useSearchWords(
    searchTerm,
    id || "",
    selectedLevel
  ) as {
    suggestions: WordSuggestion[];
    isLoading: boolean;
  };

  /**
   * 검색 폼 외부 클릭 감지 기능
   * 사용자가 검색 폼 외부를 클릭하면 자동완성 목록을 닫는다
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const searchForm = document.querySelector(".search-form");
      if (searchForm && !searchForm.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /**
   * 검색창 포커스 처리
   * 검색어가 있는 상태에서 포커스되면 자동완성 목록을 표시한다
   */
  const handleSearchFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
    if (searchTerm) {
      setShowSuggestions(true);
    }
  };

  /**
   * 검색창 마우스 버튼 누름 처리
   * 검색어가 있는 상태에서 마우스 버튼이 눌리면 자동완성 목록을 표시한다
   */
  const handleSearchMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchTerm) {
      setShowSuggestions(true);
      console.log("searchTerm", searchTerm);
    }
  };

  /**
   * 검색창 마우스 버튼 뗌 처리
   * 검색어가 있는 상태에서 마우스 버튼을 떼면 자동완성 목록을 표시한다
   */
  const handleSearchMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchTerm) {
      setShowSuggestions(true);
    }
  };

  /**
   * 검색어 입력 변경 처리
   * 입력값이 변경될 때 검색어를 업데이트하고, 자동완성 표시 여부를 설정한다
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(!!value);
    setIsSearchSubmitted(false);
  };

  /**
   * 검색 폼 제출 처리
   * 폼이 제출되면 검색을 실행하고 로딩 상태를 표시한다
   */
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearchLoading(true);
      setSubmittedSearchTerm(searchTerm);
      setIsSearchSubmitted(true);
      setShowSuggestions(false);
      setTimeout(() => setIsSearchLoading(false), 500);
    }
  };

  /**
   * 자동완성 제안 클릭 처리
   * 제안된 단어를 클릭하면 해당 단어로 검색을 실행한다
   */
  const handleSuggestionClick = (suggestion: WordSuggestion) => {
    const searchWord = suggestion.word || suggestion.reading;
    console.log("선택된 단어:", searchWord);

    setIsSearchLoading(true);
    setSearchTerm(searchWord);
    setSubmittedSearchTerm(searchWord);
    setIsSearchSubmitted(true);
    setShowSuggestions(false);
    setTimeout(() => setIsSearchLoading(false), 500);
  };

  const wordbookValue = wordbookMap[selectedWordbook] || "all";

  const getWordCount = () => {
    if (selectedLevel === "전체") {
      const totalStats = stats?.find((stat) => stat.level === "all");
      if (!totalStats) return 0;

      switch (selectedWordbook) {
        case "외운 단어장":
          return totalStats.memorized_words;
        case "복습이 필요한 단어장":
          return totalStats.not_memorized_words;
        case "공부해야 할 단어":
          return (
            parseInt(totalStats.total_words) -
            (parseInt(totalStats.memorized_words) +
              parseInt(totalStats.not_memorized_words))
          );
        default:
          return totalStats.total_words;
      }
    }

    const currentLevelStats = stats?.find(
      (stat) => stat.level === selectedLevel
    );
    if (!currentLevelStats) return 0;

    switch (selectedWordbook) {
      case "외운 단어장":
        return currentLevelStats.memorized_words;
      case "복습이 필요한 단어장":
        return currentLevelStats.not_memorized_words;
      case "공부해야 할 단어":
        return (
          parseInt(currentLevelStats.total_words) -
          (parseInt(currentLevelStats.memorized_words) +
            parseInt(currentLevelStats.not_memorized_words))
        );
      default:
        return currentLevelStats.total_words;
    }
  };

  const showSearchInput = selectedLevel === "전체";

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSearchTerm("");
    setSubmittedSearchTerm("");
    setIsSearchSubmitted(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-8 flex flex-col items-center">
        <LevelSelector
          levels={levels}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
        />

        <WordbookSelector
          wordbooks={wordbooks}
          selectedWordbook={selectedWordbook}
          onWordbookChange={setSelectedWordbook}
        />

        {showSearchInput && (
          <div className="w-full max-w-7xl mb-4">
            <SearchContainer
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              onSearchClear={() => {
                setSearchTerm("");
                setSubmittedSearchTerm("");
                setIsSearchSubmitted(false);
              }}
              onSearchFocus={handleSearchFocus}
              onSearchMouseDown={handleSearchMouseDown}
              onSearchMouseUp={handleSearchMouseUp}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              isSuggestionsLoading={isSuggestionsLoading}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}

        <div className="w-full max-w-7xl bg-gray-100 p-6 rounded-md shadow-md overflow-y-auto max-h-[80vh] min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-4">
              {selectedLevel} - {selectedWordbook}
              <span className="text-base text-gray-600">
                {isStatsLoading ? "로딩 중..." : `단어 수: ${getWordCount()}개`}
              </span>
              {isSearchSubmitted && submittedSearchTerm && showSearchInput && (
                <span className="text-sm text-blue-600">
                  "{submittedSearchTerm}" 검색 결과
                </span>
              )}
            </h2>
          </div>

          {isSearchLoading && showSearchInput && (
            <div className="flex justify-center items-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB7C5]"></div>
              <span className="ml-2 text-gray-600">검색 중...</span>
            </div>
          )}

          <WordsProvider
            level={selectedLevel === "전체" ? "all" : selectedLevel}
            wordbookValue={wordbookValue}
            searchTerm={submittedSearchTerm}
            isSearchSubmitted={isSearchSubmitted}
          >
            {children}
          </WordsProvider>
        </div>
      </div>
    </ProtectedRoute>
  );
}
