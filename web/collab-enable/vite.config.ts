import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
