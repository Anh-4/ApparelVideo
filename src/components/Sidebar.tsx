import React from 'react';
import { Flow } from 'flow-sdk';
import { SectionLabel, PillButton, FieldDropdown, TextInput, SegmentedToggle } from './Primitives';

interface SidebarProps {
  frontImage: any;
  setFrontImage: (img: any) => void;
  backImage: any;
  setBackImage: (img: any) => void;
  description: string;
  setDescription: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  aspectRatio: '9:16' | '16:9';
  setAspectRatio: (val: '9:16' | '16:9') => void;
  onGenerate: () => void;
  onGenerateCombo: () => void;
  isGenerating: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  frontImage, setFrontImage,
  backImage, setBackImage,
  description, setDescription,
  category, setCategory,
  duration, setDuration,
  aspectRatio, setAspectRatio,
  onGenerate, onGenerateCombo, isGenerating
}) => {
  const handleSelectImage = async (type: 'front' | 'back') => {
    try {
      const media = await Flow.media.select({ filter: 'image' });
      if (type === 'front') setFrontImage(media);
      else setBackImage(media);
    } catch (e) {
      console.log('User cancelled selection');
    }
  };

  return (
    <div className="relative border-r border-[rgba(218,220,224,0.15)] flex flex-col items-start justify-between overflow-y-auto dark-scrollbar px-[10px] py-[12px] w-[300px] h-full min-h-0 bg-[#0e0e0e] shrink-0">
      <div className="flex flex-col gap-[24px] items-start w-full">

        <div className="flex flex-col gap-2 items-start w-full">
          <SectionLabel>Hình ảnh sản phẩm</SectionLabel>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => handleSelectImage('front')}
              className="aspect-[3/4] rounded-xl border border-dashed border-[#595959] hover:border-[#969696] flex flex-col items-center justify-center gap-1 transition-colors overflow-hidden bg-white/5"
            >
              {frontImage ? (
                <img src={`data:${frontImage.mimeType};base64,${frontImage.base64}`} className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] text-white/50">add_photo_alternate</span>
                  <span className="text-[10px] text-white/50">Mặt trước</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleSelectImage('back')}
              className="aspect-[3/4] rounded-xl border border-dashed border-[#595959] hover:border-[#969696] flex flex-col items-center justify-center gap-1 transition-colors overflow-hidden bg-white/5"
            >
              {backImage ? (
                <img src={`data:${backImage.mimeType};base64,${backImage.base64}`} className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] text-white/50">add_photo_alternate</span>
                  <span className="text-[10px] text-white/50">Mặt sau</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <SectionLabel>Thông tin sản phẩm</SectionLabel>
          <div className="flex flex-col gap-1.5 w-full">
            <FieldDropdown
              label="Loại sản phẩm"
              value={category}
              options={['Áo polo', 'Áo thun (T-shirt)', 'Hoodie', 'Áo khoác', 'Váy/Đầm', 'Quần Jeans']}
              onChange={setCategory}
            />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 ml-2">Mô tả chất liệu & Thiết kế</span>
              <TextInput
                value={description}
                onChange={setDescription}
                placeholder="VD: Cotton cá sấu thoáng khí, thiết kế cổ bẻ phối màu hiện đại..."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start w-full">
          <SectionLabel>Cấu hình video</SectionLabel>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 ml-1">Thời lượng</span>
              <SegmentedToggle
                value={duration}
                onChange={setDuration}
                items={[
                  { value: '4s', label: '4s' },
                  { value: '6s', label: '6s' },
                  { value: '8s', label: '8s' },
                  { value: '10s', label: '10s' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 ml-1">Tỷ lệ khung hình</span>
              <SegmentedToggle
                value={aspectRatio}
                onChange={(v) => setAspectRatio(v as any)}
                items={[
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[8px] items-start w-full pt-4 mt-auto">
        <PillButton
          variant="outline"
          onClick={onGenerateCombo}
          isGenerating={isGenerating}
          icon={<span className="material-symbols-outlined text-[18px]">auto_awesome_motion</span>}
        >
          {isGenerating ? 'Đang xử lý...' : 'Tạo Combo 4 Phong Cách'}
        </PillButton>
        <PillButton
          variant="solid"
          onClick={onGenerate}
          isGenerating={isGenerating}
          icon={<span className="material-symbols-outlined text-[18px]">movie</span>}
        >
          {isGenerating ? 'Đang khởi tạo...' : 'Tạo Video Đơn'}
        </PillButton>
      </div>
    </div>
  );
};
