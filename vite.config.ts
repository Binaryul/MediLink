import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['prompt-holy-ram.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5173',
        changeOrigin: true,
      },
    },
  }
});
