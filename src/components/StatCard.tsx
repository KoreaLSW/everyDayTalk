import { WordStat } from "@/types/words";
import Link from "next/link";

interface StatCardProps {
  stat: WordStat;
}

export default function StatCard({ stat }: StatCardProps) {
  const progressPercent = (
    (parseInt(stat.memorized_words) / parseInt(stat.total_words)) *
    100
  ).toFixed(1);

  return (
    <Link href={`/vocabulary?level=${stat.level}`} className="block h-full">
      <article className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
        <header className="text-2xl font-bold text-[#FF6B91] mb-3">
          {stat.level}
        </header>
        <div className="space-y-2">
          <dl className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <dt className="text-gray-600">전체</dt>
              <dd className="font-semibold">{stat.total_words}</dd>
            </div>
            <div className="flex justify-between items-center text-sm">
              <dt className="text-gray-600">외운 단어</dt>
              <dd className="font-semibold text-green-500">
                {stat.memorized_words}
              </dd>
            </div>
            <div className="flex justify-between items-center text-sm">
              <dt className="text-gray-600">복습이 필요한 단어</dt>
              <dd className="font-semibold text-red-500">
                {stat.not_memorized_words}
              </dd>
            </div>
          </dl>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B91] h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={parseInt(stat.memorized_words)}
                aria-valuemin={0}
                aria-valuemax={parseInt(stat.total_words)}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progressPercent}% 완료
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
