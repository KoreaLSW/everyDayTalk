"use client";
import { useState } from "react";
import { Home, Book, MessageSquare, Video } from "lucide-react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState("home");

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
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
