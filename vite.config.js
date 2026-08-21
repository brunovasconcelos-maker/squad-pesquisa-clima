import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/squad-gestao-pessoas/
export default defineConfig({
  plugins: [react()],
  base: '/squad-gestao-pessoas/',
})
