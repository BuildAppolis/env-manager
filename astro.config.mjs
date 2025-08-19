import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read port from env-manager config
let port = 3001; // Default fallback
try {
  const configPath = path.join(os.homedir(), '.env-manager', 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    port = config.ports?.http || config.defaultPort || 3001;
  }
} catch (error) {
  console.warn('Could not read env-manager config, using default port 3001');
}

// Also check environment variable
if (process.env.ENV_MANAGER_PORT) {
  port = parseInt(process.env.ENV_MANAGER_PORT, 10);
}

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react()
  ],
  server: {
    port: port,
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
