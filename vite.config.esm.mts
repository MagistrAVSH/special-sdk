import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import dts from 'vite-plugin-dts';

import { version } from './package.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'dist/esm',
      lib: {
        entry: resolve(__dirname, 'src/sdk.ts'),
        name: 'SpecialSDK',
        fileName: 'sdk',
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: env.PORT ? Number.parseInt(env.PORT) : 3000,
    },
    plugins: [
      dts({
        insertTypesEntry: true,
      }),
    ],
    define: {
      'process.env': {
        NODE_ENV: 'production',
        version,
      },
    },
  };
});
