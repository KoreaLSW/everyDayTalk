export default function QuizLoading() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-[#FFB7C5] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">퀴즈를 준비하고 있습니다...</p>
    </div>
  );
}
