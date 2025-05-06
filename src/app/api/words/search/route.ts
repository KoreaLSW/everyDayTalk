import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("term");
  const userId = searchParams.get("user_id");
  const level = searchParams.get("level");

  if (!term) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 검색어 전처리
    const searchTerm = term.trim();
    const exactPattern = searchTerm;
    const startPattern = `${searchTerm}%`;
    const containsPattern = `%${searchTerm}%`;

    // search-results 스타일의 쿼리 적용
    let query = `
      SELECT 
        w.word_id, 
        w.word, 
        w.reading, 
        w.meanings, 
        w.level,
        -- 정확도 점수 계산
        CASE
          WHEN w.word = $1 THEN 100  -- 단어 완전 일치 (최고 점수)
          WHEN w.reading = $1 THEN 90  -- 읽기 완전 일치
          WHEN w.word ILIKE $2 THEN 80  -- 단어 시작 부분 일치
          WHEN w.reading ILIKE $2 THEN 70  -- 읽기 시작 부분 일치
          WHEN w.word ILIKE $3 THEN 60  -- 단어 부분 일치
          WHEN w.reading ILIKE $3 THEN 50  -- 읽기 부분 일치
          WHEN array_to_string(w.meanings, ' ') ILIKE $3 THEN 40  -- 의미 부분 일치
          ELSE 30  -- 전체 텍스트 검색 일치
        END AS score
      FROM words w
      WHERE 
        w.search_vector @@ plainto_tsquery('simple', $1)  -- 전체 텍스트 검색
      `;

    // 파라미터 배열 초기화
    const params = [exactPattern, startPattern, containsPattern];
    let paramIndex = 4;

    // 레벨 필터링 (있을 경우)
    if (level && level !== "all" && level !== "전체") {
      query += ` AND w.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    // search-results 스타일의 정렬 적용
    query += `
      ORDER BY
        score DESC,  -- 정확도 높은 것 먼저
        CASE w.level
          WHEN 'N5' THEN 1
          WHEN 'N4' THEN 2
          WHEN 'N3' THEN 3
          WHEN 'N2' THEN 4
          WHEN 'N1' THEN 5
          ELSE 6
        END,
        length(w.word) ASC  -- 짧은 단어 우선
      LIMIT 10`;

    console.log("실행 쿼리:", query);
    console.log("파라미터:", params);

    const results = await db.query(query, params);

    return NextResponse.json({ results: results.rows });
  } catch (error) {
    console.error("Error searching words:", error);
    return NextResponse.json(
      { error: "Failed to search words", details: String(error) },
      { status: 500 }
    );
  }
}
