"use client";

import React, { useState } from "react";

import type { WordCardProps } from "@/types/words";
import { useUpdateWordStatus } from "@/hooks/useWord";
import { useSession } from "next-auth/react";

type Props = WordCardProps & {
  index: number;
};

export default function WordCard({
  word_id,
  word,
  reading,
  meanings,
  part_of_speech,
  level,
  status,
  index,
}: Props) {
  const { data: session } = useSession();
  const { id: userId } = (session && session.user) || {};

  const { updateWordStatus } = useUpdateWordStatus(userId!); // ✅ 훅 사용
  const [memorized, setMemorized] = useState(status);

  const handleStatusChange = async (status: "memorized" | "notMemorized") => {
    const newStatus = memorized === status ? null : status;
    setMemorized(newStatus);
    await updateWordStatus(word_id, newStatus); // ✅ 훅에서 API 요청 실행
  };

  return (
    <div className="w-full p-2 bg-white border border-gray-200 rounded-2xl shadow-md mb-2">
      <div className="flex items-center">
        <span className="mr-2 text-xl">{index + 1}.</span>
        <h2 className="text-2xl font-bold text-gray-900 mr-2">{word}</h2>
        <span className="text-sm text-gray-400 mr-2">{part_of_speech}</span>
        <span className="text-sm px-2 py-1 bg-pink-100 text-pink-600 rounded-full">
          {level}
        </span>
      </div>

      <p className="text-lg text-gray-500">{reading}</p>

      <div className="mt-2 flex">
        <span className="text-md font-medium text-gray-800">의미:</span>
        <ul>
          {meanings.map((meaning, index) => (
            <li key={index}>
              {index + 1}. {meaning}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={memorized === "memorized"}
            onChange={() => handleStatusChange("memorized")}
            className="w-4 h-4 text-green-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">외운 단어</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={memorized === "notMemorized"}
            onChange={() => handleStatusChange("notMemorized")}
            className="w-4 h-4 text-red-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">복습이 필요한 단어</span>
        </label>
      </div>
    </div>
  );
}
