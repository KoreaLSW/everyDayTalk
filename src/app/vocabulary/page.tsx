"use client";

import WordCard from "@/components/vocabulary/WordCard";
import { useWordsContext } from "../../context/WordsContext";
import { useInfiniteWords, useSearchResults } from "../../hooks/useWord";

import type { WordType } from "../../types/words";
import { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

export default function VocabularyPage() {
  const { data: session, status } = useSession();
  const { id } = (session && session.user) || {};

  // level을 그대로 사용 (N1~N5 형식)
  const { level, wordbookValue, searchTerm, isSearchSubmitted } =
    useWordsContext();

  // 검색어가 있고 검색이 제출된 경우에만 검색 결과 사용
  const {
    words,
    isLoading: isWordsLoading,
    error: wordsError,
    loadMore,
    isLoadingMore,
    hasMoreData,
  } = useInfiniteWords(id!, level, wordbookValue);

  const {
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchResults(
    isSearchSubmitted ? searchTerm : "", // 검색이 제출된 경우에만 검색어 전달
    id!,
    level, // level을 그대로 전달 (N1~N5 형식)
    wordbookValue
  );

  // 표시할 데이터와 로딩 상태 결정
  const displayData = isSearchSubmitted && searchTerm ? searchResults : words;
  const isLoading =
    isSearchSubmitted && searchTerm ? isSearchLoading : isWordsLoading;
  const error = isSearchSubmitted && searchTerm ? searchError : wordsError;

  // 무한 스크롤 관련 코드 (검색 모드에서는 사용하지 않음)
  const observer = useRef<IntersectionObserver | null>(null);

  const lastWordRef = useCallback(
    (node: HTMLLIElement) => {
      if (isLoading || isLoadingMore || (isSearchSubmitted && searchTerm))
        return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreData) {
            loadMore();
          }
        },
        { threshold: 0.8 }
      );

      if (node) observer.current.observe(node);
    },
    [
      isLoading,
      isLoadingMore,
      loadMore,
      hasMoreData,
      isSearchSubmitted,
      searchTerm,
    ]
  );

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500">Error loading words</p>;

  return (
    <ul>
      {displayData && displayData.length > 0 ? (
        displayData.map((word: WordType, index: number) => (
          <li
            key={word.word_id}
            ref={
              !(isSearchSubmitted && searchTerm) && index === words.length - 1
                ? lastWordRef
                : null
            }
          >
            <WordCard
              word_id={word.word_id}
              word={word.word}
              level={word.level}
              meanings={word.meanings}
              part_of_speech={word.part_of_speech}
              reading={word.reading}
              status={word.status}
              index={index}
            />
          </li>
        ))
      ) : (
        <p className="text-center text-gray-500">
          {isSearchSubmitted && searchTerm
            ? "검색 결과가 없습니다."
            : "단어가 없습니다."}
        </p>
      )}

      {!(isSearchSubmitted && searchTerm) && isLoadingMore && (
        <p className="text-center text-gray-500">Loading more...</p>
      )}

      {!(isSearchSubmitted && searchTerm) &&
        !isLoadingMore &&
        !hasMoreData &&
        displayData.length > 0 && (
          <p className="text-center text-gray-500">더 이상 단어가 없습니다.</p>
        )}
    </ul>
  );
}
