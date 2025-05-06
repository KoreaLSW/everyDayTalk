"use client";

import { createContext, useContext, ReactNode } from "react";

interface WordsContextType {
  level: string;
  wordbookValue: "all" | "memorized" | "notMemorized" | "unChecked";
  searchTerm: string;
  isSearchSubmitted: boolean;
}

interface WordsProviderProps {
  children: ReactNode;
  level: string;
  wordbookValue: "all" | "memorized" | "notMemorized" | "unChecked";
  searchTerm?: string;
  isSearchSubmitted?: boolean;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({
  children,
  level,
  wordbookValue,
  searchTerm = "",
  isSearchSubmitted = false,
}: WordsProviderProps) {
  const value = {
    level,
    wordbookValue,
    searchTerm,
    isSearchSubmitted,
  };

  return (
    <WordsContext.Provider value={value}>{children}</WordsContext.Provider>
  );
}

export function useWordsContext() {
  const context = useContext(WordsContext);
  if (context === undefined) {
    throw new Error("useWordsContext must be used within a WordsProvider");
  }
  return context;
}
