import { Pool } from "pg";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 최대 연결 개수 (기본값 10)
  idleTimeoutMillis: 30000, // 사용하지 않는 연결을 30초 후에 종료
  connectionTimeoutMillis: 2000, // 연결 타임아웃 2초
  ssl: {
    rejectUnauthorized: false, // SSL 인증서를 검증하지 않음
  },
});

export const query = (text: string, params?: any[]) => db.query(text, params);
export default db;
