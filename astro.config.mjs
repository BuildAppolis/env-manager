import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 3001,
    host: true
  },
  vite: {
    optimizeDeps: {
      exclude: ['better-sqlite3']
    },
    esbuild: {
      target: 'es2020'
    }
  }
});
