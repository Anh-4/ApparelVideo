import React, { useEffect } from 'react';

export const GlobalStyles: React.FC = () => {
  useEffect(() => {
    const id = 'apparel-tool-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .dark-scrollbar::-webkit-scrollbar { width: 4px; }
      .dark-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      .dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

      @keyframes dropdown-enter {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-dropdown { animation: dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

      video::-webkit-media-controls-panel {
        background-image: linear-gradient(transparent, rgba(0,0,0,0.5)) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
};
