import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CareOrbit Super Admin Portal - Port 5174
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
