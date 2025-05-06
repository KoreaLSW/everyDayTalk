import { WordSuggestion } from "@/types/words";
import { SearchForm } from "./SearchForm";
import { SearchSuggestions } from "./SearchSuggestions";

/**
 * SearchContainer 컴포넌트 Props 타입 정의
 *
 * @property {string} searchTerm - 현재 입력된 검색어
 * @property {function} onSearchChange - 검색어 변경 시 호출되는 함수 (입력 이벤트 핸들러)
 * @property {function} onSearchSubmit - 검색 폼 제출 시 호출되는 함수 (Enter 키 또는 검색 버튼)
 * @property {function} onSearchClear - 검색어 지우기 버튼 클릭 시 호출되는 함수
 * @property {function} onSearchFocus - 검색창이 포커스되었을 때 호출되는 함수
 * @property {function} onSearchMouseDown - 검색창에서 마우스 버튼을 눌렀을 때 호출되는 함수
 * @property {function} onSearchMouseUp - 검색창에서 마우스 버튼을 뗐을 때 호출되는 함수
 *
 * @property {boolean} showSuggestions - 자동완성 제안 표시 여부
 * @property {WordSuggestion[]} suggestions - 표시할 자동완성 제안 목록
 * @property {boolean} isSuggestionsLoading - 자동완성 제안 로딩 중 여부
 * @property {function} onSuggestionClick - 자동완성 제안 항목 클릭 시 호출되는 함수
 */
interface SearchContainerProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchClear: () => void;
  onSearchFocus: (e: React.FocusEvent) => void;
  onSearchMouseDown: (e: React.MouseEvent) => void;
  onSearchMouseUp: (e: React.MouseEvent) => void;
  showSuggestions: boolean;
  suggestions: WordSuggestion[];
  isSuggestionsLoading: boolean;
  onSuggestionClick: (suggestion: WordSuggestion) => void;
}

export function SearchContainer({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSearchFocus,
  onSearchMouseDown,
  onSearchMouseUp,
  showSuggestions,
  suggestions,
  isSuggestionsLoading,
  onSuggestionClick,
}: SearchContainerProps) {
  return (
    <div className="w-full relative">
      <SearchForm
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onSearchClear={onSearchClear}
        onSearchFocus={onSearchFocus}
        onSearchMouseDown={onSearchMouseDown}
        onSearchMouseUp={onSearchMouseUp}
      />
      <SearchSuggestions
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        isSuggestionsLoading={isSuggestionsLoading}
        searchTerm={searchTerm}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  );
}
