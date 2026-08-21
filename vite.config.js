import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/squad-pesquisa-clima/
export default defineConfig({
  plugins: [react()],
  base: '/squad-pesquisa-clima/',
})
