"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const AuthButton = () => {
  const { data: session } = useSession();

  return session ? (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 text-white bg-red-500 rounded-lg"
    >
      로그아웃
    </button>
  ) : (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 text-white bg-blue-500 rounded-lg"
    >
      로그인
    </button>
  );
};

export default AuthButton;
