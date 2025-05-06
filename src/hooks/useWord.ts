import { WordType } from "@/types/words";
import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";
import { useState, useEffect } from "react";

export function useInfiniteWords(
  userId: string,
  level: string,
  wordbookValue: string
) {
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (index) =>
      `/api/words?user_id=${userId}&level=${level}&wordbook=${wordbookValue}&page=${
        index + 1
      }`, // ✅ 페이지네이션 적용
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
    { revalidateOnFocus: false }
  );

  const words: WordType[] = data ? data.flat() : [];

  // ✅ 마지막 요청에서 빈 배열을 받으면 더 이상 요청하지 않음
  const hasMoreData = data && data[data.length - 1]?.length > 0;

  const isLoadingMore =
    isValidating || (data && typeof data[size - 1] === "undefined");

  return {
    words,
    isLoading: !data && !error,
    error,
    loadMore: () => {
      if (hasMoreData) setSize(size + 1); // ✅ 빈 배열이면 더 이상 요청하지 않음
    },
    isLoadingMore,
    hasMoreData, // ✅ 더 불러올 데이터가 있는지 여부
  };
}

// 재사용 가능한 키 상수 추가
export const WORD_STATS_KEY = (userId: string) =>
  `/api/words/stats?user_id=${userId}`;

export function useWordStats(userId: string) {
  const { data, error, isValidating } = useSWR(
    userId ? WORD_STATS_KEY(userId) : null,
    async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch word stats");
        return await res.json();
      } catch (err) {
        console.error("Error fetching word stats:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      dedupingInterval: 1000, // 1초 동안 중복 요청 방지
    }
  );

  return {
    stats: data?.stats ?? [],
    isLoading: !data && !error && isValidating,
    error,
    // mutate 함수 추가
    refreshStats: () => mutate(WORD_STATS_KEY(userId)),
  };
}

export function useUpdateWordStatus(userId: string) {
  const updateWordStatus = async (
    wordId: string,
    status: "memorized" | "notMemorized" | null
  ) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      if (status) {
        await fetch("/api/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, wordId, status }),
        });
      } else {
        await fetch("/api/words", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, wordId }),
        });
      }

      // 상태 업데이트 후 stats 재호출
      await mutate(WORD_STATS_KEY(userId));
    } catch (error) {
      console.error("Error updating word status:", error);
    }
  };

  return { updateWordStatus };
}

// 검색어 자동완성을 위한 훅
export function useSearchWords(
  searchTerm: string,
  userId: string,
  level: string
) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // 300ms debounce 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // API 호출 및 데이터 가져오기
  const { data, error } = useSWR(
    debouncedTerm
      ? `/api/words/search?term=${encodeURIComponent(
          debouncedTerm
        )}&user_id=${userId}`
      : null,
    async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000,
    }
  );

  return {
    suggestions: data?.results || [], // API 응답 형식에 맞춤
    isLoading: !error && !data && debouncedTerm !== "",
    isError: error,
  };
}

// 검색 결과를 가져오는 훅
export function useSearchResults(
  searchTerm: string,
  userId: string,
  level: string,
  wordbookValue: string
) {
  const { data, error, isValidating } = useSWR(
    searchTerm
      ? `/api/words/search-results?term=${searchTerm}&user_id=${userId}&level=${level}&wordbook=${wordbookValue}`
      : null,
    async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch search results");
        return await res.json();
      } catch (err) {
        console.error("Error fetching search results:", err);
        throw err;
      }
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    results: data?.results || [],
    totalCount: data?.totalCount || 0,
    isLoading: !data && !error && isValidating,
    error,
  };
}
