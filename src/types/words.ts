export type WordType = {
  word_id: string;
  word: string; // 일본어 단어
  reading: string; // 히라가나 / 가타카나
  meanings: string[]; // 한글 뜻
  part_of_speech: string; // 품사
  level: string; // JLPT 레벨 (예: N1, N2, N3 등)
  status: "memorized" | "notMemorized" | null; // 외운 상태
};

export type WordCardProps = WordType & {
  onStatusChange?: (status: "memorized" | "notMemorized") => void; // 외운 상태 변경 핸들러
};

export type WordStat = {
  level: string;
  total_words: string;
  memorized_words: string;
  not_memorized_words: string;
};

export interface WordSuggestion {
  word_id: string;
  word: string;
  reading: string;
  meanings: string[];
  level: string;
}
