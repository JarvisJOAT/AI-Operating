import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration for GasWeb.info
 * 
 * This configuration sets up the development and build environment
 * for the GasWeb marketing website.
 * 
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@lib': '/src/lib',
      '@hooks': '/src/hooks',
      '@contexts': '/src/contexts',
      '@assets': '/src/assets',
    },
  },
});

