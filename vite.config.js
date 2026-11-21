import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Giúp chạy mượt mà trên GitHub Pages và bất kỳ hosting tĩnh nào
})
