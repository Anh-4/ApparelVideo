import React, { useState } from 'react';
import { Flow } from 'flow-sdk';
import { PillButton } from './Primitives';
import { VideoResult } from '../App';

interface PreviewAreaProps {
  videoResult: VideoResult | null;
  comboResults: VideoResult[] | null;
  isGenerating: boolean;
  error: string | null;
  aspectRatio: '9:16' | '16:9';
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ videoResult, comboResults, isGenerating, error, aspectRatio }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadState, setDownloadState] = useState<Record<string, 'idle' | 'loading' | 'done'>>({});

  const handleDownload = async (video: VideoResult, id: string) => {
    setDownloadState(prev => ({ ...prev, [id]: 'loading' }));
    try {
      await Flow.download({
        base64: video.base64,
        mimeType: video.mimeType,
        filename: `apparel_${video.style || 'promo'}_${Date.now()}.mp4`
      });
      setDownloadState(prev => ({ ...prev, [id]: 'done' }));
      setTimeout(() => setDownloadState(prev => ({ ...prev, [id]: 'idle' })), 2000);
    } catch (e) {
      setDownloadState(prev => ({ ...prev, [id]: 'idle' }));
    }
  };

  const renderVideo = (video: VideoResult, id: string, showLabel = false) => (
    <div key={id} className="relative group bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center w-full h-full">
      <video
        src={`data:${video.mimeType};base64,${video.base64}`}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
      {showLabel && video.style && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
          <span className="text-[9px] font-bold tracking-wider text-white/90 uppercase">{video.style}</span>
        </div>
      )}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleDownload(video, id)}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">
            {downloadState[id] === 'done' ? 'check' : 'download'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Banner lỗi/cảnh báo: hiện ở MỌI trạng thái (kể cả khi combo có kết quả) để không che mất message như "Đã tạo 3/4". */}
      {error && (videoResult || comboResults || isGenerating) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-[90%] px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[12px] text-center backdrop-blur-md shadow-lg">
          {error}
        </div>
      )}

      {comboResults ? (
        <div className="grid grid-cols-2 gap-4 w-full h-full max-w-5xl max-h-[85vh]">
          {comboResults.map((v, i) => renderVideo(v, `combo-${i}`, true))}
        </div>
      ) : videoResult ? (
        <div className={`relative flex flex-col items-center gap-4 transition-all duration-500 ${isZoomed ? 'scale-110' : 'scale-100'} w-full h-full max-w-4xl max-h-[80vh]`}>
          <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center ${aspectRatio === '9:16' ? 'h-full aspect-[9/16]' : 'w-full aspect-[16/9]'}`}>
            <video
              src={`data:${videoResult.mimeType};base64,${videoResult.base64}`}
              className="w-full h-full object-contain"
              autoPlay
              loop
              controls
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{isZoomed ? 'close_fullscreen' : 'open_in_full'}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <PillButton
              variant="outline"
              onClick={() => handleDownload(videoResult, 'main')}
              icon={<span className="material-symbols-outlined text-[18px]">{downloadState['main'] === 'done' ? 'check' : 'download'}</span>}
            >
              {downloadState['main'] === 'loading' ? 'Đang tải...' : downloadState['main'] === 'done' ? 'Đã tải xong' : 'Tải Video HD'}
            </PillButton>
          </div>
        </div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className={`bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4 ${aspectRatio === '9:16' ? 'h-[70vh] aspect-[9/16]' : 'w-[60vw] aspect-[16/9]'}`}>
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-lg font-medium text-white/80">Đang thiết kế video của bạn...</p>
              <p className="text-sm text-white/40">Quá trình này có thể mất 1-3 phút tùy số lượng</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px] text-white/20">movie_edit</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white/90">Sẵn sàng tạo Video?</h2>
          <p className="text-white/40">Tải lên ảnh sản phẩm và mô tả phong cách. Chọn "Tạo Video Đơn" cho một phong cách cụ thể hoặc "Tạo Combo" để xem 4 bối cảnh khác nhau.</p>
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
