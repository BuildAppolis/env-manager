import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react()
  ],
  server: {
    port: 3001,
    host: true
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['better-sqlite3']
    },
    esbuild: {
      target: 'es2020'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
});
