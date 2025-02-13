"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="h-full flex-1 p-8 rounded-lg">
      <div className="text-center">
        {session ? (
          <>
            <h2 className="text-3xl font-bold text-[#FF6B91]">
              {session.user?.name}님, 환영합니다! 🌸
            </h2>
            <p className="text-gray-600 mt-2">일본어 학습을 계속해볼까요?</p>
            <button
              onClick={() => signOut()}
              className="mt-4 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              로그아웃
            </button>
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

        <div className="mt-6 p-4 bg-[#FFF5F8] rounded-lg shadow">
          <h3 className="text-lg font-semibold">오늘의 추천 단어 🎯</h3>
          <p className="text-xl font-bold text-[#FF6B91]">
            ありがとう (Arigatou) - 감사합니다
          </p>
        </div>
      </div>
    </main>
  );
}
