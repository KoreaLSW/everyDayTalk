"use client";

import VocabularyLayoutComponent from "@/components/vocabulary/VocabularyLayoutComponent";
import { ReactNode, Suspense } from "react";

type Props = {
  children: ReactNode;
};

export default function VocabularyLayout({ children }: Props) {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <VocabularyLayoutComponent children={children} />
    </Suspense>
  );
}
