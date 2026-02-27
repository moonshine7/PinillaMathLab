import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/scatter-plot/',
  plugins: [react()],
  server: { port: 3000, host: '0.0.0.0' }
})
