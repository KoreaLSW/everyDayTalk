import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// 임시 메시지 저장 (실제로는 데이터베이스 사용)
let messages: any[] = [
  {
    id: "1",
    user_id: "system",
    username: "시스템",
    message: "일본어 학습 채팅방에 오신 것을 환영합니다! 🌸",
    timestamp: new Date().toISOString(),
    type: "system",
  },
];

// 메시지 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastMessageId = searchParams.get("last_message_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    // 마지막 메시지 ID 이후의 새 메시지만 반환
    let filteredMessages = messages;
    if (lastMessageId) {
      const lastIndex = messages.findIndex((msg) => msg.id === lastMessageId);
      filteredMessages = lastIndex >= 0 ? messages.slice(lastIndex + 1) : [];
    }

    // 최신 메시지부터 제한된 수만 반환
    const recentMessages = filteredMessages.slice(-limit);

    return NextResponse.json({
      success: true,
      messages: recentMessages,
      total: messages.length,
    });
  } catch (error) {
    console.error("메시지 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "메시지를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

// 메시지 전송 (POST)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "메시지 내용이 필요합니다." },
        { status: 400 }
      );
    }

    // 새 메시지 생성
    const newMessage = {
      id: Date.now().toString(),
      user_id: session.user.id || session.user.email,
      username: session.user.name || "익명",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: "user",
    };

    // 메시지 저장 (실제로는 데이터베이스에 저장)
    messages.push(newMessage);

    // 메시지 개수 제한 (최근 1000개만 유지)
    if (messages.length > 1000) {
      messages = messages.slice(-1000);
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("메시지 전송 오류:", error);
    return NextResponse.json(
      { success: false, error: "메시지 전송에 실패했습니다." },
      { status: 500 }
    );
  }
}
