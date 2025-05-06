import { Search } from "lucide-react";

interface SearchFormProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchClear: () => void;
  onSearchFocus: (e: React.FocusEvent) => void;
  onSearchMouseDown: (e: React.MouseEvent) => void;
  onSearchMouseUp: (e: React.MouseEvent) => void;
}

export function SearchForm({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSearchFocus,
  onSearchMouseDown,
  onSearchMouseUp,
}: SearchFormProps) {
  return (
    <form
      onSubmit={onSearchSubmit}
      className="relative search-form"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="text"
        placeholder="단어 검색..."
        value={searchTerm}
        onChange={onSearchChange}
        onFocus={onSearchFocus}
        onMouseDown={onSearchMouseDown}
        onMouseUp={onSearchMouseUp}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB7C5] focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <Search size={18} />
      </button>
      {searchTerm && (
        <button
          type="button"
          onClick={onSearchClear}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </form>
  );
}
