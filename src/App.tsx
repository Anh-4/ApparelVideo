import React, { useState, useEffect } from 'react';
import { Flow } from 'flow-sdk';
import { Sidebar } from './components/Sidebar';
import { PreviewArea } from './components/PreviewArea';
import { OptionsPanel } from './components/OptionsPanel';
import { GlobalStyles } from './components/GlobalStyles';
import { ApiKeyModal, hasApiKey } from './components/ApiKeyModal';
import { STYLE_OPTIONS, buildVideoPrompt } from './constants';

export type VideoResult = { base64: string; mimeType: string; mediaId: string; style?: string };

export default function App() {
  const [frontImage, setFrontImage] = useState<any>(null);
  const [backImage, setBackImage] = useState<any>(null);
  const [materialDescription, setMaterialDescription] = useState('');
  const [category, setCategory] = useState('Áo polo');
  const [duration, setDuration] = useState('8s');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');

  const [selectedStyle, setSelectedStyle] = useState('Street Style');
  const [selectedModel, setSelectedModel] = useState('Người mẫu nữ');

  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [comboResults, setComboResults] = useState<VideoResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  const durationMap: Record<string, number> = { '4s': 4, '6s': 6, '8s': 8, '10s': 10 };

  // Lần đầu mở mà chưa có key -> bật popup nhập key.
  useEffect(() => {
    if (!hasApiKey()) setShowKeyModal(true);
  }, []);

  /** Trả về true nếu đủ điều kiện để chạy (có ảnh trước + có key); ngược lại set lỗi. */
  const ensureReady = (): boolean => {
    if (!frontImage) {
      setError('Vui lòng tải lên ít nhất ảnh mặt trước sản phẩm.');
      return false;
    }
    if (!hasApiKey()) {
      setShowKeyModal(true);
      setError('Chưa có Google AI API key — hãy nhập key để tạo video.');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!ensureReady()) return;

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setComboResults(null);

    try {
      const selectedDuration = durationMap[duration] || 8;
      const prompt = buildVideoPrompt({
        styleName: selectedStyle,
        modelName: selectedModel,
        categoryVi: category,
        material: materialDescription,
      });

      const referenceIds = [frontImage.mediaId];
      if (backImage) referenceIds.push(backImage.mediaId);

      const result = await Flow.generate.video({
        prompt,
        modelDisplayName: 'Omni Flash',
        aspectRatio,
        durationSeconds: selectedDuration,
        referenceImageMediaIds: referenceIds,
      });

      setVideoResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Có lỗi xảy ra trong quá trình tạo video. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCombo = async () => {
    if (!ensureReady()) return;

    setIsGenerating(true);
    setError(null);
    setVideoResult(null);
    setComboResults(null);

    try {
      const selectedDuration = durationMap[duration] || 8;
      const referenceIds = [frontImage.mediaId];
      if (backImage) referenceIds.push(backImage.mediaId);

      // Sinh cả 4 style song song. allSettled: 1 style lỗi không kéo sập cả mẻ.
      const settled = await Promise.allSettled(
        STYLE_OPTIONS.map(async (style) => {
          const prompt = buildVideoPrompt({
            styleName: style.name,
            modelName: selectedModel,
            categoryVi: category,
            material: materialDescription,
          });

          const result = await Flow.generate.video({
            prompt,
            modelDisplayName: 'Omni Flash',
            aspectRatio,
            durationSeconds: selectedDuration,
            referenceImageMediaIds: referenceIds,
          });

          return { ...result, style: style.name } as VideoResult;
        })
      );

      const results = settled
        .filter((r): r is PromiseFulfilledResult<VideoResult> => r.status === 'fulfilled')
        .map((r) => r.value);

      if (results.length === 0) {
        const firstErr = settled.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        throw new Error(firstErr?.reason?.message || 'Không tạo được style nào. Vui lòng thử lại.');
      }

      if (results.length < STYLE_OPTIONS.length) {
        setError(`Đã tạo ${results.length}/${STYLE_OPTIONS.length} phong cách (một vài style lỗi).`);
      }

      setComboResults(results);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Có lỗi xảy ra trong quá trình tạo combo. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0e0e0e] text-white overflow-hidden">
      <GlobalStyles />

      <Sidebar
        frontImage={frontImage}
        setFrontImage={setFrontImage}
        backImage={backImage}
        setBackImage={setBackImage}
        description={materialDescription}
        setDescription={setMaterialDescription}
        category={category}
        setCategory={setCategory}
        duration={duration}
        setDuration={setDuration}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        onGenerate={handleGenerate}
        onGenerateCombo={handleGenerateCombo}
        isGenerating={isGenerating}
      />

      <div className="flex-1 relative flex min-h-0">
        <button
          onClick={() => setShowKeyModal(true)}
          title="Google AI API Key"
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 h-[34px] rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-[11px] font-medium"
        >
          <span className="material-symbols-outlined text-[16px]">key</span>
          API Key
        </button>

        <PreviewArea
          videoResult={videoResult}
          comboResults={comboResults}
          isGenerating={isGenerating}
          error={error}
          aspectRatio={aspectRatio}
        />
      </div>

      <OptionsPanel
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      <ApiKeyModal open={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </div>
  );
}
