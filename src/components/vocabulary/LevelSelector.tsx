interface LevelSelectorProps {
  levels: string[];
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

export function LevelSelector({
  levels,
  selectedLevel,
  onLevelChange,
}: LevelSelectorProps) {
  return (
    <div className="flex gap-4 mb-4">
      {levels.map((levelOption) => (
        <button
          key={levelOption}
          className={`px-4 py-2 rounded-md text-gray-900 transition-colors
            ${
              selectedLevel === levelOption
                ? "bg-[#FFB7C5]"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          onClick={() => onLevelChange(levelOption)}
        >
          {levelOption}
        </button>
      ))}
    </div>
  );
}
