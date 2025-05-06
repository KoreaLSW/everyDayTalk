import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get("term");
  const userId = searchParams.get("user_id");
  const level = searchParams.get("level");
  const wordbook = searchParams.get("wordbook") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;

  if (!term) {
    return NextResponse.json({ results: [], totalCount: 0 });
  }

  try {
    // 검색어 전처리
    const searchTerm = term.trim();
    const exactPattern = searchTerm;
    const startPattern = `${searchTerm}%`;
    const containsPattern = `%${searchTerm}%`;

    // 개선된 검색 쿼리
    let query = `
        SELECT 
          w.word_id, 
          w.word, 
          w.reading, 
          w.meanings, 
          w.level, 
          w.part_of_speech,
          COALESCE(uw.status, NULL) as status,
          -- 정확도 점수 계산
          CASE
            WHEN w.word = $2 THEN 100  -- 단어 완전 일치 (최고 점수)
            WHEN w.reading = $2 THEN 90  -- 읽기 완전 일치
            WHEN w.word ILIKE $3 THEN 80  -- 단어 시작 부분 일치
            WHEN w.reading ILIKE $3 THEN 70  -- 읽기 시작 부분 일치
            WHEN w.word ILIKE $4 THEN 60  -- 단어 부분 일치
            WHEN w.reading ILIKE $4 THEN 50  -- 읽기 부분 일치
            WHEN array_to_string(w.meanings, ' ') ILIKE $4 THEN 40  -- 의미 부분 일치
            ELSE 30  -- 전체 텍스트 검색 일치
          END AS score
        FROM words w
        LEFT JOIN user_words uw ON w.word_id = uw.word_id AND uw.user_id = $1
        WHERE 
          w.search_vector @@ plainto_tsquery('simple', $2)  -- 전체 텍스트 검색
        `;

    // 카운트 쿼리 최적화 - 사용자 단어 조인 제거하고 필요한 필터만 유지
    let countQuery = `
        SELECT 
          (SELECT reltuples::bigint FROM pg_class WHERE relname = 'words') as estimated_count
        `;

    // 실제 카운트가 필요한 경우에만 실행할 쿼리 (estimated_count가 0이면 실행)
    let actualCountQuery = `
        SELECT COUNT(*) 
        FROM words w
        WHERE w.search_vector @@ plainto_tsquery('simple', $1)
        `;

    const params = [userId, exactPattern, startPattern, containsPattern];
    let paramIndex = 5;
    const countParams = [searchTerm];
    let countParamIndex = 2;

    // 레벨 필터링
    if (level && level !== "all") {
      query += ` AND w.level = $${paramIndex}`;
      actualCountQuery += ` AND w.level = $${countParamIndex}`;
      params.push(level);
      countParams.push(level);
      paramIndex++;
      countParamIndex++;
    }

    // 단어장 필터링 - 메인 쿼리에만 적용
    if (wordbook !== "all") {
      if (wordbook === "memorized") {
        query += ` AND uw.status = 'memorized'`;
      } else if (wordbook === "notMemorized") {
        query += ` AND uw.status = 'notMemorized'`;
      } else if (wordbook === "unChecked") {
        query += ` AND (uw.status IS NULL OR (uw.status != 'memorized' AND uw.status != 'notMemorized'))`;
      }
    }

    // 정렬 조건 추가 - 레벨 순서와 단어 길이 고려
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
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    params.push(pageSize.toString(), ((page - 1) * pageSize).toString());

    // 디버깅을 위한 쿼리 로깅
    console.log("검색 쿼리:", query);
    console.log("파라미터:", params);

    // 메인 쿼리 먼저 실행
    const results = await db.query(query, params);

    // 추정 카운트 확인
    const estimatedResult = await db.query(countQuery);
    let totalCount = parseInt(estimatedResult.rows[0].estimated_count || "0");

    // 결과가 있는 경우 정확한 카운트 수행 (실제 결과가 많은 경우에는 추정치 사용)
    if (results.rows.length > 0 && results.rows.length < pageSize) {
      const countResult = await db.query(actualCountQuery, countParams);
      totalCount = parseInt(countResult.rows[0].count || "0");
    }

    // 결과 반환 - 더보기 여부도 함께 제공
    return NextResponse.json({
      results: results.rows,
      totalCount: totalCount,
      hasMore: results.rows.length === pageSize,
    });
  } catch (error) {
    console.error("Error searching words:", error);
    return NextResponse.json(
      { error: "Failed to search words", details: String(error) },
      { status: 500 }
    );
  }
}
