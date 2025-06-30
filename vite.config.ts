import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build: {
      // Skip type checking during build since we have types issues to fix
      // but want to deploy anyway for demo purposes
      // In production, should fix all type errors first
      minify: mode === 'production',
      sourcemap: mode !== 'production',
    },
    optimizeDeps: {
      exclude: ['framer-motion'],
    }
  }
})