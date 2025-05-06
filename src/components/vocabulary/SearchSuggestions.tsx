import { WordSuggestion } from "@/types/words";

interface SearchSuggestionsProps {
  showSuggestions: boolean;
  suggestions: WordSuggestion[];
  isSuggestionsLoading: boolean;
  searchTerm: string;
  onSuggestionClick: (suggestion: WordSuggestion) => void;
}

export function SearchSuggestions({
  showSuggestions,
  suggestions,
  isSuggestionsLoading,
  searchTerm,
  onSuggestionClick,
}: SearchSuggestionsProps) {
  if (!showSuggestions) return null;

  if (
    searchTerm &&
    (!suggestions || suggestions.length === 0) &&
    !isSuggestionsLoading
  ) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
        검색 결과가 없습니다
      </div>
    );
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSuggestionClick(suggestion);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {suggestion.word}
                </span>
                <span className="text-sm text-gray-500">
                  {suggestion.reading}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {suggestion.meanings[0]}
              </div>
            </div>
            <div className="text-xs text-white bg-[#FFB7C5] px-2 py-1 rounded-full ml-2 whitespace-nowrap">
              {suggestion.level}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
