import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Optimized build configuration
  build: {
    sourcemap: false, // Disable for smaller bundle
    minify: 'terser', // Better compression
    target: 'es2020', // Modern browsers only
    rollupOptions: {
      output: {
        // Improved code splitting
        manualChunks: { 
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    }
  },
  // Enable aggressive tree-shaking
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  }
}))