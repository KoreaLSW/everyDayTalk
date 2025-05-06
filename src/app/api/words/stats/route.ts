import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/api/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    // ✅ user_id 검증 (빈 값만 체크, 숫자 여부 검사 X)
    if (!userId || userId.trim() === "") {
      return NextResponse.json({ message: "Invalid user_id" }, { status: 400 });
    }

    const sql = `
      WITH level_counts AS (
        SELECT 
          w.level,
          COUNT(*) AS total_count
        FROM words w
        GROUP BY w.level
      ),
      user_word_stats AS (
        SELECT 
          w.level,
          COUNT(CASE WHEN uw.status = 'memorized' THEN 1 END) AS memorized_count,
          COUNT(CASE WHEN uw.status = 'notMemorized' THEN 1 END) AS not_memorized_count
        FROM user_words uw
        JOIN words w ON uw.word_id = w.word_id
        WHERE uw.user_id = $1
        GROUP BY w.level
      ),
      combined_stats AS (
        SELECT 
          CONCAT(lc.level::TEXT) AS level,
          lc.total_count AS total_words,
          COALESCE(uws.memorized_count, 0) AS memorized_words,
          COALESCE(uws.not_memorized_count, 0) AS not_memorized_words
        FROM level_counts lc
        LEFT JOIN user_word_stats uws ON lc.level = uws.level
      )
      SELECT * FROM combined_stats
      
      UNION ALL
      
      SELECT 
        'all' AS level,
        SUM(total_words) AS total_words,
        SUM(memorized_words) AS memorized_words,
        SUM(not_memorized_words) AS not_memorized_words
      FROM combined_stats;
    `;

    const result = await query(sql, [userId]);

    return NextResponse.json({ stats: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("SQL Execution Error:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
