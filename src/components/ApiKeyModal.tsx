import React, { useState, useEffect } from 'react';
import { KEY_STORAGE } from 'flow-sdk';

/** Kiểm tra đã có Google AI key chưa (env khi dev hoặc localStorage qua popup). */
export function hasApiKey(): boolean {
  const env = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (env && String(env).trim()) return true;
  return !!(localStorage.getItem(KEY_STORAGE) || '').trim();
}

export const ApiKeyModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(localStorage.getItem(KEY_STORAGE) || '');
      setShow(false); // mỗi lần mở lại che key cho an toàn
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    const k = value.trim();
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-[90vw] bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-2xl animate-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[20px] text-white">key</span>
          <h2 className="text-white text-[15px] font-bold">Google AI API Key (Veo)</h2>
        </div>
        <p className="text-white/40 text-[11px] mb-4 leading-relaxed">
          Dán key Google AI (AI Studio) — dùng cho Veo. Key được lưu trên máy bạn (localStorage), chỉ gửi tới Google khi tạo video.
        </p>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="AIza..."
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            className="w-full bg-white/5 border border-[#333] rounded-xl pl-3 pr-10 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-[#555] transition-colors"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            title={show ? 'Ẩn key' : 'Hiện key'}
            aria-label={show ? 'Ẩn key' : 'Hiện key'}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
        {show && value.trim() && (
          <p className="text-white/30 text-[10px] mt-1.5 font-mono">Độ dài: {value.trim().length} ký tự</p>
        )}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="inline-block text-[10px] text-blue-400/80 hover:text-blue-400 mt-2"
        >
          Lấy API key tại aistudio.google.com/apikey →
        </a>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-[40px] rounded-xl border border-[#595959] text-white text-[12px] font-bold uppercase hover:bg-white/5 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={save}
            className="flex-1 h-[40px] rounded-xl bg-white text-black text-[12px] font-bold uppercase hover:bg-gray-200 transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
