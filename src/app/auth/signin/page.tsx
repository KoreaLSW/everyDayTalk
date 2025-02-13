"use client";

import { signIn } from "next-auth/react";

const SignInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">로그인</h2>
        <p className="text-gray-600 text-center mt-2">
          Google 계정으로 로그인하세요.
        </p>
        <hr className="my-4" />
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })} // Google 로그인 후 홈으로 이동
          className="w-full p-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
        >
          Google로 로그인
        </button>
      </div>
    </div>
  );
};

export default SignInPage;
