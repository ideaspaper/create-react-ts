import * as path from 'path';

import react from '@vitejs/plugin-react';
import {defineConfig as defineViteConfig, mergeConfig} from 'vite';
import {defineConfig as defineVitestConfig} from 'vitest/config';

const viteConfig = defineViteConfig({
  plugins: [
    react(),
    {
      name: 'remove-react-devtools',
      transformIndexHtml(html) {
        if (process.env.NODE_ENV === 'production') {
          return html.replace(
            /<script src="http:\/\/localhost:8097"><\/script>/,
            '',
          );
        }
        return html;
      },
    },
  ],
  resolve: {
    alias: [{find: '@', replacement: path.resolve(__dirname, 'src')}],
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.ts',
  },
});

export default mergeConfig(viteConfig, vitestConfig);
