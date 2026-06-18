import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { version } from './package.json';

// base: './' -> asset dùng đường dẫn tương đối (tiện đóng gói / mở qua file:// sau này).
// alias 'flow-sdk' -> src/flow-sdk.ts để App.tsx import bare 'flow-sdk' chạy được.
export default defineConfig({
  plugins: [react()],
  base: './',
  // Nhúng version từ package.json -> hiển thị trên giao diện (bump version là UI tự đổi).
  define: { __APP_VERSION__: JSON.stringify(version) },
  resolve: {
    alias: {
      'flow-sdk': path.resolve(__dirname, 'src/flow-sdk.ts'),
    },
  },
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: { outDir: 'dist' },
});
