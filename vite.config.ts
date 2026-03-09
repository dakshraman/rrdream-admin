import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://game.rrdream.in',
        changeOrigin: true,
      },
      '/OnlineImages': {
        target: process.env.ONLINE_IMAGES_URL || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});