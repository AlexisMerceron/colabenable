import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Use global `describe`, `it`, etc.
    environment: 'jsdom', // Simulates a browser-like environment
    setupFiles: './vitest.setup.ts', // File where we configure things like `@testing-library/jest-dom`
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/UI/Components'),
      '@pages': path.resolve(__dirname, 'src/UI/Pages'),
      '@utils': path.resolve(__dirname, 'src/Utils'),
      '@hooks': path.resolve(__dirname, 'src/Hooks'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
})
