interface WordbookSelectorProps {
  wordbooks: string[];
  selectedWordbook: string;
  onWordbookChange: (wordbook: string) => void;
}

export function WordbookSelector({
  wordbooks,
  selectedWordbook,
  onWordbookChange,
}: WordbookSelectorProps) {
  return (
    <div className="flex gap-4 border-b pb-2 mb-4">
      {wordbooks.map((book) => (
        <button
          key={book}
          className={`px-4 py-2 transition-colors
            ${
              selectedWordbook === book
                ? "text-gray-900 border-b-2 border-[#FFB7C5]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => onWordbookChange(book)}
        >
          {book}
        </button>
      ))}
    </div>
  );
}
