import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/api/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const level = searchParams.get("level");
    const wordbook = searchParams.get("wordbook") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { message: "Missing user_id parameter" },
        { status: 400 }
      );
    }

    // 기본 조건 설정
    let condition = "";
    let params: any[] = [userId]; // userId는 항상 첫 번째 파라미터
    let paramIndex = 2; // 다음 파라미터 인덱스

    // level 조건 추가 (all이 아닐 때만)
    if (level && level !== "all") {
      condition += "WHERE w.level = $" + paramIndex++;
      params.push(level);
    }

    // wordbook 조건 추가
    if (wordbook === "memorized") {
      condition += condition ? " AND " : "WHERE ";
      condition += "uw.status = 'memorized'";
    } else if (wordbook === "notMemorized") {
      condition += condition ? " AND " : "WHERE ";
      condition += "uw.status = 'notMemorized'";
    } else if (wordbook === "unChecked") {
      condition += condition ? " AND " : "WHERE ";
      condition +=
        "(uw.status IS NULL OR (uw.status != 'memorized' AND uw.status != 'notMemorized'))";
    }

    const sql = `
      SELECT 
        w.word_id,
        w.level,
        w.reading,
        w.word,
        w.meanings,
        w.part_of_speech,
        uw.status
      FROM words w
      LEFT JOIN user_words uw 
        ON w.word_id = uw.word_id 
        AND uw.user_id = $1
      ${condition}
      ORDER BY w.word_id  -- 단어 ID 기준 정렬 (DB에 저장된 순서)
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching words:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, wordId, status } = await req.json();
    if (!userId || !wordId || !status) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      );
    }
    // ✅ 현재 시간을 KST로 변환
    const kstNow = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Seoul",
    });

    // ✅ user_words 테이블에 상태 저장 (INSERT 또는 UPDATE)
    const sql = `
      INSERT INTO user_words (user_id, word_id, status, last_reviewed)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, word_id)
      DO UPDATE SET status = EXCLUDED.status, last_reviewed = EXCLUDED.last_reviewed;
    `;

    await query(sql, [userId, wordId, status, kstNow]);

    return NextResponse.json(
      { message: "Word status updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating word status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, wordId } = await req.json();

    if (!userId || !wordId) {
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      );
    }

    // ✅ user_words 테이블에서 해당 단어 삭제
    const sql = `DELETE FROM user_words WHERE user_id = $1 AND word_id = $2;`;

    await query(sql, [userId, wordId]);

    return NextResponse.json(
      { message: "Word status removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting word status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
