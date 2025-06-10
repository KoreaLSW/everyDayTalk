import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { AudioControlsProps } from "./types";

export default function AudioControls({
  currentQuestion,
  isPlaying,
  canSpeak,
  onSpeak,
  onStop,
}: AudioControlsProps) {
  if (!canSpeak) return null;

  const handleRestartTTS = () => {
    console.log("🔄 사용자가 TTS 재시작 요청");

    // speechSynthesis 재시작
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setTimeout(() => {
      const voices = speechSynthesis.getVoices();
      console.log("🔄 TTS 재시작 완료, 사용 가능한 음성:", voices.length);

      // 재시작 완료 후 테스트 음성 재생
      setTimeout(() => {
        onSpeak("テスト", 0.8);
      }, 300);
    }, 200);
  };

  return (
    <div className="text-center mb-8">
      <div className="mb-6">
        <Volume2 className="w-16 h-16 text-[#FFB7C5] mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-4">
          🎧 스피커 버튼을 눌러 일본어 발음을 들어보세요
        </p>
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">소리가 안 들린다면:</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onSpeak("テスト", 0.8)}
              disabled={isPlaying}
              className="text-sm px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              🔊 음성 테스트
            </button>
            <button
              onClick={handleRestartTTS}
              disabled={isPlaying}
              className="text-sm px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              TTS 재시작
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => onSpeak(currentQuestion.wordInfo.reading, 0.6)}
          disabled={isPlaying}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFB7C5] text-white rounded-lg hover:bg-[#FF9CAE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Volume2 className="w-5 h-5" />
          {isPlaying ? "재생 중..." : "천천히 듣기"}
        </button>

        <button
          onClick={() => onSpeak(currentQuestion.wordInfo.reading, 1.0)}
          disabled={isPlaying}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Volume2 className="w-5 h-5" />
          {isPlaying ? "재생 중..." : "보통 속도"}
        </button>

        {isPlaying && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <VolumeX className="w-5 h-5" />
            중지
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 팁: 소리가 안 들린다면 시스템 볼륨을 확인하거나 Chrome/Edge
        브라우저를 사용해보세요
        <br />
        🔄 단어가 끝나면 자동으로 버튼이 원래 상태로 돌아갑니다
        <br />
        ⚠️ 첫 재생 시 소리가 안 들릴 수 있습니다. 중지 버튼을 누르고 다시
        재생해보세요
      </div>
    </div>
  );
}
