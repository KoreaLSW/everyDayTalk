"use client";
import { useState, useEffect } from "react";
import { Home, Book, MessageSquare, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { id: "", label: "홈", icon: <Home /> },
  {
    id: "vocabulary",
    label: "단어장",
    icon: <Book />,
  },
  {
    id: "quiz",
    label: "퀴즈",
    icon: <MessageSquare />,
  },
  {
    id: "chat",
    label: "실시간 채팅",
    icon: <MessageSquare />,
  },
  { id: "zoom", label: "줌 교육", icon: <Video /> },
];

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("");
  const pathname = usePathname();

  // URL 경로가 변경될 때마다 activeTab 업데이트
  useEffect(() => {
    const path = pathname.split("/")[1]; // 첫 번째 경로 세그먼트 가져오기
    setActiveTab(path);
  }, [pathname]);

  return (
    <aside className="w-1/12 min-w-[200px] bg-[#FFB7C5] text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-center">🗻 EveryDayTalk</h1>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            href={`/${item.id}`}
            key={item.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === item.id
                ? "bg-white text-[#FF6B91]"
                : "hover:bg-[#FFA3B8]"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
