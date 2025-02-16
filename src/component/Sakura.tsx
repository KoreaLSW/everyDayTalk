"use client";
import { useEffect, useState } from "react";
import style from "./sakura.module.css";

const NUM_BLOSSOMS = 30; // 생성할 벚꽃 개수 증가

export default function Sakura() {
  const [blossoms, setBlossoms] = useState<
    { id: number; left: string; duration: string; size: string }[]
  >([]);

  useEffect(() => {
    const newBlossoms = Array.from({ length: NUM_BLOSSOMS }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      duration: `${Math.random() * 5 + 5}s`, // 5~10초 랜덤 낙하 속도
      size: `${Math.random() * 15 + 15}px`, // 15~30px 크기 랜덤
    }));
    setBlossoms(newBlossoms);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {blossoms.map(({ id, left, duration, size }) => (
          <div
            key={id}
            className={style.sakura}
            style={{
              left,
              animationDuration: duration,
              width: size,
              height: size,
            }}
          />
        ))}
      </div>
    </div>
  );
}
