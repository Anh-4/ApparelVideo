import React from 'react';
import { SectionLabel } from './Primitives';
import { STYLE_OPTIONS } from '../constants';

interface OptionsPanelProps {
  selectedStyle: string;
  setSelectedStyle: (val: string) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  selectedStyle, setSelectedStyle,
  selectedModel, setSelectedModel
}) => {
  const models = ['Người mẫu nam', 'Người mẫu nữ', 'Cặp đôi nam nữ'];

  return (
    <div className="relative border-l border-[rgba(218,220,224,0.15)] flex flex-col items-start gap-6 overflow-y-auto dark-scrollbar px-[10px] py-[12px] w-[300px] h-full min-h-0 bg-[#0e0e0e] shrink-0">

      {/* Video Style Selection */}
      <div className="flex flex-col gap-3 items-start w-full">
        <SectionLabel>Phong cách Video</SectionLabel>
        <div className="grid grid-cols-1 gap-2 w-full">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.name}
              onClick={() => setSelectedStyle(style.name)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all text-left ${
                selectedStyle === style.name
                  ? 'bg-white/10 border-white/20'
                  : 'bg-transparent border-[#595959] hover:border-[#7a7a7a]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedStyle === style.name ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>
                <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[12px] font-medium ${selectedStyle === style.name ? 'text-white' : 'text-white/60'}`}>{style.name}</span>
                <span className="text-[10px] text-white/30">{style.desc}</span>
              </div>
              {selectedStyle === style.name && (
                <span className="material-symbols-outlined text-[16px] text-white ml-auto">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="flex flex-col gap-3 items-start w-full">
        <SectionLabel>Lựa chọn người mẫu</SectionLabel>
        <div className="flex flex-col gap-2 w-full">
          {models.map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`h-[42px] px-4 rounded-xl border flex items-center gap-2 transition-all ${
                selectedModel === model
                  ? 'bg-[#969696] border-transparent text-black'
                  : 'bg-transparent border-[#595959] text-white/60 hover:border-[#7a7a7a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {model.includes('nam') && !model.includes('cặp') ? 'man' : model.includes('nữ') && !model.includes('cặp') ? 'woman' : 'group'}
              </span>
              <span className="text-[12px] font-medium">{model}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-3 rounded-xl bg-white/5 border border-white/10 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[14px] text-white/40">info</span>
          <span className="text-[10px] text-white/40 font-medium">Gợi ý</span>
        </div>
        <p className="text-[10px] text-white/30 leading-relaxed">
          AI sẽ tự động lồng ghép chất liệu và thiết kế bạn mô tả vào bối cảnh {selectedStyle.toLowerCase()} với {selectedModel.toLowerCase()}.
        </p>
      </div>
    </div>
  );
};
