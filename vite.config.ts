import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const SERVER_PORT = process.env.SERVER_PORT || 3004;

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
      // Notification routes go to the local Express server
      '/api/notifications': {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
      // All other /api/* calls go to the backend game API
      '/api': {
        target: process.env.VITE_API_URL || 'https://game.rrdream.in',
        changeOrigin: true,
      },
      '/OnlineImages': {
        target: process.env.ONLINE_IMAGES_URL || `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});