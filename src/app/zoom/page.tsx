import ProtectedRoute from "@/component/ProtectedRoute";

export default function ZoomPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Zoom 페이지</h1>
        <p>로그인한 사용자만 접근할 수 있습니다.</p>
      </div>
    </ProtectedRoute>
  );
}
