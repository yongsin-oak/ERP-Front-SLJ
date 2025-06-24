import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // โหลด .env.<mode> เช่น .env.production
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BACKEND_API_URL': JSON.stringify(env.VITE_BACKEND_API_URL),
    },
  }
})
