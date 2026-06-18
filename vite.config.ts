import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// base: './' -> asset dùng đường dẫn tương đối (tiện đóng gói / mở qua file:// sau này).
// alias 'flow-sdk' -> src/flow-sdk.ts để App.tsx import bare 'flow-sdk' chạy được.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      'flow-sdk': path.resolve(__dirname, 'src/flow-sdk.ts'),
    },
  },
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  build: { outDir: 'dist' },
});
