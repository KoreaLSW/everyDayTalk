import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "";
  const level = searchParams.get("level");
  const count = parseInt(searchParams.get("count") || "10");
  const userId = searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json(
      { message: "Missing user_id parameter" },
      { status: 400 }
    );
  }

  try {
    // 성능 최적화된 쿼리 - 사용자 단어와의 조인 제거
    let query = `
      SELECT 
        w.word_id, 
        w.word, 
        w.reading, 
        w.meanings, 
        w.level,
        w.part_of_speech
      FROM words w
      LEFT JOIN user_words uw ON w.word_id = uw.word_id AND uw.user_id = $1
      WHERE w.meanings IS NOT NULL AND array_length(w.meanings, 1) > 0
      AND uw.status IS NULL  -- 아직 학습하지 않은 단어만 선택
    `;

    // 퀴즈 유형에 맞는 추가 필터
    if (type === "word-meaning" || type === "meaning-word") {
      query += `
        AND w.word IS NOT NULL
        AND length(w.word) > 0
        `;
    } else if (type === "reading") {
      query += `
        AND w.reading IS NOT NULL
        AND length(w.reading) > 0
        AND w.word IS NOT NULL
        AND length(w.word) > 0
        `;
    }

    // 파라미터 배열 초기화 (userId는 이미 $1로 사용됨)
    let params = [];
    let paramIndex = 2; // $1은 이미 userId로 사용됨

    // 레벨 필터링
    if (level && level !== "all") {
      query += ` AND w.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    // 성능 최적화된 무작위 선택
    query += `
      ORDER BY random()
      LIMIT $${paramIndex}`;

    params.push(count.toString());

    console.log("쿼리_quzi:", query);
    console.log("파라미터:", [userId, ...params]);

    // 쿼리 실행 시 파라미터 전달
    const result = await db.query(query, [userId, ...params]);

    // 사용자 단어 상태 별도로 가져오기 (필요한 단어만)
    if (result.rows.length > 0) {
      const wordIds = result.rows.map((row) => row.word_id);

      const userWordsQuery = `
        SELECT word_id, status
        FROM user_words
        WHERE user_id = $1 AND word_id = ANY($2::text[])
      `;

      const userWordsResult = await db.query(userWordsQuery, [userId, wordIds]);

      // 단어 상태 정보 추가
      const userWordsMap = new Map();
      userWordsResult.rows.forEach((row) => {
        userWordsMap.set(row.word_id, row.status);
      });

      // 각 단어에 상태 정보 추가
      result.rows.forEach((word) => {
        word.status = userWordsMap.get(word.word_id) || null;
      });
    }

    return NextResponse.json({ words: result.rows });
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { message: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
