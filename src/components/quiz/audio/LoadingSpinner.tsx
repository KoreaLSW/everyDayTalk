export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB7C5] mx-auto mb-4"></div>
        <p>퀴즈를 준비하고 있습니다...</p>
      </div>
    </div>
  );
}
