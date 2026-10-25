import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { compiler } from './scripts/compiler.mjs';

export default defineConfig({
  plugins: [
    react(),
    babel({ plugins: [[compiler, { panicThreshold: 'all_errors' }]] }),
  ],
});
