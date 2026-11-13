import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      'react-compiler-runtime': fileURLToPath(new URL('./.cache/runtime.mjs', import.meta.url)),
    },
  },
  plugins: [react()],
});
