import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'framer-motion'] },
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
})