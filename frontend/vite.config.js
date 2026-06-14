import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración limpia sin el plugin conflictivo de Tailwind
export default defineConfig({
  plugins: [react()],
})