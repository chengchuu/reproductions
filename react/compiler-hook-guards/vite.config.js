import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { compiler } from './scripts/compiler.mjs';

export default defineConfig({
  resolve: {
    alias: {
      'react-compiler-runtime': fileURLToPath(new URL('./.cache/runtime.mjs', import.meta.url)),
    },
  },
  plugins: [
    react(),
    babel({
      include: /[\\/]src[\\/].*\.jsx$/,
      plugins: [
        [
          compiler,
          {
            panicThreshold: 'all_errors',
            environment: {
              enableEmitHookGuards: {
                source: 'react-compiler-runtime',
                importSpecifierName: '$dispatcherGuard',
              },
            },
          },
        ],
      ],
    }),
  ],
});
