import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { version } from './package.json';

export default defineConfig(() => ({
  build: {
    outDir: 'dist/umd',
    lib: {
      entry: resolve(__dirname, 'src/sdk.ts'),
      name: 'SpecialSDK',
      fileName: 'sdk',
      formats: ['umd'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {
      NODE_ENV: 'production',
      version,
    },
  },
}));
