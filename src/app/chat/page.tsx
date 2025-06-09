"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, MessageCircle, Users } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  type: "user" | "system";
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 새 메시지로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지 조회
  const fetchMessages = async (isInitial = false) => {
    try {
      const lastMessageId =
        messages.length > 0 ? messages[messages.length - 1].id : "";
      const url = isInitial
        ? "/api/chat/messages"
        : `/api/chat/messages?last_message_id=${lastMessageId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (isInitial) {
          setMessages(data.messages);
        } else if (data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages]);
        }
      }
    } catch (error) {
      console.error("메시지 조회 실패:", error);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Optimistic Update - 즉시 UI에 표시
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: session?.user?.id || session?.user?.email || "",
      username: session?.user?.name || "나",
      message: messageToSend,
      timestamp: new Date().toISOString(),
      type: "user",
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      if (data.success) {
        // 임시 메시지를 실제 메시지로 교체
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? data.message : msg
          )
        );
      } else {
        // 실패 시 임시 메시지 제거
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        alert(data.error || "메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      // 오류 시 임시 메시지 제거
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
      console.error("메시지 전송 오류:", error);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 초기 메시지 로드
  useEffect(() => {
    if (session) {
      fetchMessages(true);
    }
  }, [session]);

  // 실시간 메시지 폴링 (3초마다)
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      intervalRef.current = setInterval(() => {
        fetchMessages(false);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, messages.length]);

  // 새 메시지 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB7C5] mx-auto mb-4"></div>
            <p>채팅방을 불러오고 있습니다...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-full p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-[#FFB7C5]" />
            <div>
              <h1 className="text-xl font-bold">실시간 채팅</h1>
              <p className="text-sm text-gray-600">
                일본어 학습자들과 대화해보세요
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>온라인</span>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.user_id === (session?.user?.id || session?.user?.email)
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === "system"
                      ? "bg-yellow-100 text-yellow-800 text-center mx-auto"
                      : msg.user_id ===
                        (session?.user?.id || session?.user?.email)
                      ? "bg-[#FFB7C5] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.type !== "system" &&
                    msg.user_id !==
                      (session?.user?.id || session?.user?.email) && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {msg.username}
                      </div>
                    )}
                  <div className="text-sm">{msg.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 메시지 입력 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (일본어로 대화해보세요! 🗾)"
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB7C5] focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="px-6 py-2 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "전송 중..." : "전송"}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 일본어 단어나 문장을 연습해보세요! Enter로 전송, Shift+Enter로
            줄바꿈
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
