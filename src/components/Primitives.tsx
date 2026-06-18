import React, { useState, useRef, useEffect } from 'react';

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center px-2">
    <span className="text-[11px] font-medium text-[rgba(218,220,224,0.9)] tracking-[0.1px] uppercase">
      {children}
    </span>
  </div>
);

export const PillButton: React.FC<{
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'filled' | 'outline' | 'solid';
  onClick?: () => void;
  isGenerating?: boolean;
}> = ({ icon, children, variant = 'filled', onClick, isGenerating }) => {
  const base = 'flex items-center gap-[6px] justify-center w-full h-[42px] rounded-xl font-medium tracking-[0.1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    filled: 'bg-[#969696] hover:bg-[#a6a6a6] active:bg-[#868686] text-black text-[13px] pl-[12px] pr-[12px] select-none',
    outline: 'border border-[#595959] hover:bg-white/5 active:bg-white/10 backdrop-blur-[40px] text-[13px] pl-[16px] pr-[16px] text-white select-none',
    solid: 'bg-white hover:bg-gray-200 active:bg-gray-300 text-black text-[13px] pl-[16px] pr-[16px] select-none',
  };
  return (
    <button className={`${base} ${variants[variant]}`} onClick={onClick} disabled={isGenerating}>
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export const TextInput: React.FC<{
  value: string; onChange: (val: string) => void; placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="border border-[#595959] hover:border-[#7a7a7a] focus:border-[#969696] rounded-xl w-full h-[100px] px-3 py-2.5 resize-none bg-transparent text-[12px] font-medium text-white placeholder-[rgba(218,220,224,0.25)] tracking-[0.1px] focus:outline-none transition-colors"
  />
);

export const SegmentedToggle: React.FC<{
  value: string; items: { value: string; label: string; icon?: React.ReactNode }[];
  onChange: (val: string) => void;
}> = ({ value, items, onChange }) => (
  <div className="flex w-full items-center border border-[#595959] rounded-xl overflow-hidden bg-transparent">
    {items.map((item) => (
      <button key={item.value} type="button" onClick={() => onChange(item.value)}
        className={`flex-1 flex items-center justify-center gap-1 h-[36px] px-2 py-1 text-[11px] font-medium tracking-[0.1px] transition-all cursor-pointer ${
          value === item.value ? 'bg-[#969696] text-black' : 'text-[rgba(218,220,224,0.75)] hover:text-white hover:bg-white/5'
        }`}>
        {item.icon}<span>{item.label}</span>
      </button>
    ))}
  </div>
);

export const IconToggleBar: React.FC<{
  value: string; items: { value: string; icon: React.ReactNode }[]; onChange: (val: string) => void;
}> = ({ value, items, onChange }) => (
  <div className="flex w-full items-center border border-[#595959] rounded-xl overflow-hidden bg-transparent">
    {items.map((item) => (
      <button key={item.value} type="button" onClick={() => onChange(item.value)}
        className={`flex-1 flex items-center justify-center h-[36px] rounded-xl transition-all cursor-pointer ${
          value === item.value ? 'bg-[#969696] text-black' : 'text-[rgba(218,220,224,0.55)] hover:text-white hover:bg-white/5'
        }`}>
        {item.icon}
      </button>
    ))}
  </div>
);

export const FieldDropdown: React.FC<{
  label: string; value: string; options: string[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left border border-[#595959] hover:border-[#7a7a7a] transition-colors rounded-xl flex flex-col gap-0.5 justify-center pb-2 pl-3 pr-2 pt-[6px] select-none focus:outline-none bg-transparent"
      >
        <p className="text-[10px] font-medium text-[rgba(255,255,255,0.35)]">{label}</p>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-white">{value}</span>
          <span className={`material-symbols-outlined text-[18px] text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 left-0 w-full bg-[#1a1a1a] border border-[#595959] rounded-xl overflow-hidden shadow-2xl animate-dropdown origin-top">
          <div className="max-h-48 overflow-y-auto dark-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[12px] font-medium hover:bg-white/5 transition-colors ${value === opt ? 'bg-white/10 text-white' : 'text-white/60'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
