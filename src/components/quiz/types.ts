import { ReactNode } from "react";

export interface QuizType {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  comingSoon?: boolean;
}

// 퀴즈 진행 상태를 위한 enum
export enum QuizState {
  SETTINGS = "SETTINGS", // 설정(레벨 선택) 화면
  PROGRESS = "PROGRESS", // 퀴즈 진행 중
  RESULT = "RESULT", // 결과 화면
}
