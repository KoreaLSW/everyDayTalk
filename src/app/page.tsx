"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useWordStats } from "@/hooks/useWord";
import { WordStat } from "@/types/words";
import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";

export default function Home() {
  const { data: session, status } = useSession();
  const { stats } = useWordStats((session?.user?.id as string) || "");
  const [streakDays, setStreakDays] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState(0);

  useEffect(() => {
    // 임시 데이터
    setStreakDays(5);
    setTodayStudyTime(45);
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  const { name, image } = (session && session.user) || {};

  // 전체 진행률 계산
  const totalStats = stats?.find((stat: WordStat) => stat.level === "all");
  const totalProgress = totalStats
    ? (
        (parseInt(totalStats.memorized_words) /
          parseInt(totalStats.total_words)) *
        100
      ).toFixed(1)
    : "0";

  // N1부터 N5까지 정렬 (오름차순으로 변경)
  const sortedStats = stats
    ?.filter((stat: WordStat) => stat.level !== "all")
    .sort((a: WordStat, b: WordStat) => {
      const levelA = parseInt(a.level.replace("N", ""));
      const levelB = parseInt(b.level.replace("N", ""));
      return levelA - levelB; // 정렬 순서 변경 (levelA - levelB)
    });

  return (
    <main className="h-full flex-1 p-8 rounded-lg relative">
      {/* 로그아웃 버튼을 상단 우측으로 이동 */}
      {session && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}

      <div className="text-center">
        {session ? (
          <>
            <div className="flex justify-center text-center">
              {image && (
                <Image
                  src={image}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-[#FF6B91] mr-2"
                />
              )}
              <h2 className="text-3xl font-bold text-[#FF6B91]">
                {name}님, 환영합니다! 🌸
              </h2>
            </div>
            <p className="text-gray-600 mt-2">일본어 학습을 계속해볼까요?</p>

            {/* 학습 현황 대시보드 수정 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
                <div className="text-3xl font-bold mb-2">
                  {totalStats ? parseInt(totalStats.memorized_words) : 0}
                </div>
                <div className="text-sm">총 외운 단어</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg text-white">
                <div className="text-3xl font-bold mb-2">
                  {totalStats ? parseInt(totalStats.not_memorized_words) : 0}
                </div>
                <div className="text-sm">복습이 필요한 단어</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-lg text-white">
                <div className="text-3xl font-bold mb-2">
                  📈 {totalProgress}%
                </div>
                <div className="text-sm">전체 진행률</div>
              </div>
            </div>

            {/* 통계 카드 리스트 */}
            <ul
              className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 list-none"
              role="list"
            >
              {sortedStats?.map((stat: WordStat) => (
                <li key={stat.level}>
                  <StatCard stat={stat} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-[#FF6B91]">
              환영합니다! 🌸
            </h2>
            <p className="text-gray-600 mt-2">일본어 학습을 시작해볼까요?</p>
            <button
              onClick={() => signIn()}
              className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              로그인
            </button>
          </>
        )}

        {/* 학습 추천 섹션 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-[#FFF5F8] rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">오늘의 추천 단어 🎯</h3>
            <div className="space-y-2">
              <p className="text-xl font-bold text-[#FF6B91]">
                ありがとう (Arigatou)
              </p>
              <p className="text-gray-600">감사합니다</p>
              <div className="text-sm text-gray-500 mt-2">
                사용 예문: ありがとうございました。
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">복습 추천 ✨</h3>
            <div className="text-left space-y-2">
              <p className="text-gray-600">
                지난 학습에서 어려워하신 단어들입니다:
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>はじめまして (처음 뵙겠습니다)</li>
                <li>お願いします (부탁드립니다)</li>
                <li>さようなら (안녕히 계세요)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
