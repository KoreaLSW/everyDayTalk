import { VolumeX } from "lucide-react";
import { BrowserCompatibilityProps } from "./types";

export default function BrowserCompatibility({
  onBackToMenu,
}: BrowserCompatibilityProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <VolumeX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">
        음성 기능을 사용할 수 없습니다
      </h2>
      <p className="text-gray-600 mb-4">
        이 브라우저는 음성 합성 기능을 지원하지 않습니다.
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">권장 브라우저:</h3>
        <ul className="text-sm text-left space-y-1">
          <li>✅ Chrome (가장 안정적)</li>
          <li>✅ Microsoft Edge</li>
          <li>✅ Safari (Mac/iOS)</li>
          <li>⚠️ Firefox (일부 제한)</li>
        </ul>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg text-sm">
        <p className="font-semibold mb-1">문제 해결 방법:</p>
        <ul className="text-left space-y-1">
          <li>• 브라우저를 최신 버전으로 업데이트</li>
          <li>• 시스템 볼륨 및 브라우저 설정 확인</li>
          <li>• 시크릿/프라이빗 모드로 시도</li>
        </ul>
      </div>
      <button
        className="mt-4 px-6 py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] transition-colors"
        onClick={onBackToMenu}
      >
        퀴즈 메뉴로 돌아가기
      </button>
    </div>
  );
}
