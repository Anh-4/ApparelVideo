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

  useEffect(() => {
    if (open) setValue(localStorage.getItem(KEY_STORAGE) || '');
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
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          className="w-full bg-white/5 border border-[#333] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-[#555] transition-colors"
        />
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
