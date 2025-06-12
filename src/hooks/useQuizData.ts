import useSWR from "swr";
import { useState, useEffect } from "react";
import { WordType } from "@/types/words";

export interface Option {
  text: string;
  isCorrect: boolean;
  word?: string;    // 한자 표시용
  reading?: string; // 읽는 방법 표시용
  meaning?: string; // 의미 표시용
}

export interface Question {
  wordInfo: WordType;
  options: Option[];
}

export interface QuizSettings {
  level: string;
  questionCount: number;
}

// SWR 패치 함수
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("퀴즈 데이터를 가져오는데 실패했습니다");
  }
  return response.json();
};

export function useQuizData(
  quizType: string,
  userId: string | undefined,
  settings: { level: string; questionCount: number },
  shouldFetch: boolean,
  useKanji: boolean = false // 한자 사용 여부 (기본값: false)
) {
  // 캐시 키 (로컬 스토리지에 저장할 고유 식별자)
  const cacheKey = `quiz_${quizType}_${settings.level}_${settings.questionCount}`;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formattedQuestions, setFormattedQuestions] = useState<Question[]>([]);

  // SWR 키 생성 (shouldFetch가 false면 null을 전달하여 요청하지 않음)
  const key =
    shouldFetch && userId
      ? `/api/quiz/questions?type=${quizType}&level=${settings.level}&count=${settings.questionCount}&user_id=${userId}`
      : null;

  // SWR로 데이터 가져오기
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재검증 방지
      revalidateIfStale: false, // 오래된 데이터 재검증 방지
      dedupingInterval: 600000, // 10분 동안 중복 요청 방지
    }
  );
  console.log("datazz", data);
  // 다른 단어들에서 무작위로 의미 선택
  const getRandomIncorrectMeanings = (
    allWords: WordType[],
    currentWord: WordType,
    count: number
  ): string[] => {
    const otherWords = allWords.filter(
      (w) => w.word_id !== currentWord.word_id
    );
    const meanings: string[] = [];

    // 중복 방지를 위한 세트
    const usedMeanings = new Set(currentWord.meanings);

    while (meanings.length < count && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomWord = otherWords[randomIndex];

      // 해당 단어의 첫 번째 의미가 이미 사용되지 않았으면 추가
      if (randomWord.meanings[0] && !usedMeanings.has(randomWord.meanings[0])) {
        meanings.push(randomWord.meanings[0]);
        usedMeanings.add(randomWord.meanings[0]);
      }

      // 이미 확인한 단어는 제거
      otherWords.splice(randomIndex, 1);
    }

    return meanings;
  };

  // 다른 단어들에서 무작위로 일본어 단어 선택 (오디오->한자 퀴즈용)
  const getRandomIncorrectWords = (
    allWords: WordType[],
    currentWord: WordType,
    count: number
  ): WordType[] => {
    const otherWords = allWords.filter(
      (w) => w.word_id !== currentWord.word_id
    );
    const words: WordType[] = [];

    // 중복 방지를 위한 세트
    const usedWords = new Set([currentWord.word]);

    while (words.length < count && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomWord = otherWords[randomIndex];

      // 해당 단어가 이미 사용되지 않았으면 추가
      if (!usedWords.has(randomWord.word)) {
        words.push(randomWord);
        usedWords.add(randomWord.word);
      }

      // 이미 확인한 단어는 제거
      otherWords.splice(randomIndex, 1);
    }

    return words;
  };

  // 문제 포맷팅 함수
  const formatQuestions = (words: WordType[]): Question[] => {
    if (!words || words.length === 0) return [];

    // 퀴즈 타입에 따라 다른 포맷팅 적용
    if (quizType === "meaning-word") {
      // 한글 뜻을 보고 일본어 단어를 맞추는 퀴즈
      return words.map((word) => {
        // 현재 단어의 올바른 일본어 단어 (한자 + 읽기)
        const correctWord = `${word.word} (${word.reading})`;

        // 다른 단어들에서 무작위로 3개의 잘못된 일본어 단어 선택
        const incorrectWords = getRandomIncorrectWords(words, word, 3);

        // 4개의 보기 생성 및 섞기
        const options = [
          { text: correctWord, isCorrect: true },
          ...incorrectWords.map((wordText) => ({
            text: wordText.word,
            isCorrect: false,
          })),
        ].sort(() => Math.random() - 0.5);

        return {
          wordInfo: word,
          options,
        };
      });
    } else if (quizType === "listening-kanji") {
      // 오디오 퀴즈: 일본어 발음을 듣고 올바른 한자를 맞추는 퀴즈
      return words.map((word) => {
        // 다른 단어들에서 무작위로 3개의 잘못된 단어 선택
        const incorrectWords = getRandomIncorrectWords(words, word, 3);

        // 4개의 보기 생성 및 섞기
        const options = [
          {
            text: word.word,
            isCorrect: true,
            word: word.word,
            reading: word.reading,
            meaning: word.meanings[0]
          },
          ...incorrectWords.map((incorrectWord) => ({
            text: incorrectWord.word,
            isCorrect: false,
            word: incorrectWord.word,
            reading: incorrectWord.reading,
            meaning: incorrectWord.meanings[0]
          })),
        ].sort(() => Math.random() - 0.5);

        return {
          wordInfo: word,
          options,
        };
      });
    } else {
      // 기본: 일본어 단어를 보고 한글 뜻을 맞추는 퀴즈
      return words.map((word) => {
        // 현재 단어의 올바른 의미를 선택 (여러 의미가 있으면 첫 번째 것 사용)
        const correctMeaning = word.meanings[0];

        // 다른 단어들에서 무작위로 3개의 잘못된 의미 선택
        const incorrectMeanings = getRandomIncorrectMeanings(words, word, 3);

        // 4개의 보기 생성 및 섞기
        const options = [
          { text: correctMeaning, isCorrect: true },
          ...incorrectMeanings.map((meaning) => ({
            text: meaning,
            isCorrect: false,
          })),
        ].sort(() => Math.random() - 0.5);

        return {
          wordInfo: word,
          options,
        };
      });
    }
  };

  // 데이터 로드 및 문제 포맷팅
  useEffect(() => {
    if (data && data.words) {
      try {
        // 로컬 스토리지에 원본 데이터 저장
        localStorage.setItem(`${cacheKey}_data`, JSON.stringify(data.words));

        // 포맷된 퀴즈 문제 생성
        const formatted = formatQuestions(data.words);
        setFormattedQuestions(formatted);

        // 포맷된 문제도 로컬 스토리지에 저장
        localStorage.setItem(
          `${cacheKey}_formatted`,
          JSON.stringify(formatted)
        );
      } catch (err) {
        console.error("Error formatting quiz data:", err);
      }
    }
  }, [data, cacheKey]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 복원 시도
  useEffect(() => {
    if (!isLoading && !data) {
      try {
        // 로컬 스토리지에서 포맷된 문제 복원 시도
        const cachedFormatted = localStorage.getItem(`${cacheKey}_formatted`);
        if (cachedFormatted) {
          const parsed = JSON.parse(cachedFormatted);
          setFormattedQuestions(parsed);
        }
      } catch (err) {
        console.error("Error restoring cached quiz data:", err);
      }
    }
  }, [isLoading, data, cacheKey]);

  // 새로운 퀴즈 로드 함수
  const loadNewQuiz = () => {
    // 로컬 스토리지 캐시 삭제
    localStorage.removeItem(`${cacheKey}_data`);
    localStorage.removeItem(`${cacheKey}_formatted`);

    // SWR 캐시 무효화 및 재요청
    mutate();
  };

  return {
    questions: formattedQuestions,
    isLoading: isLoading && !formattedQuestions.length,
    isError: error,
    loadNewQuiz,
    mutate,
  };
}

// 사용자 단어 상태 업데이트 훅
export function useUpdateWordProgress() {
  const updateProgress = async (
    userId: string | undefined,
    wordId: string,
    isCorrect: boolean
  ) => {
    if (!userId) return;

    console.log("useUpdateWordProgress 호출", userId, wordId, isCorrect);
    const status = isCorrect ? "memorized" : "notMemorized";
    try {
      await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, wordId, status }),
      });
      return true;
    } catch (error) {
      console.error("Error updating word progress:", error);
      return false;
    }
  };

  return { updateProgress };
}
