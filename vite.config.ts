import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        'concept-gym': fileURLToPath(new URL('./concepts/gym/index.html', import.meta.url)),
        'concept-hvac': fileURLToPath(new URL('./concepts/hvac/index.html', import.meta.url)),
        'concept-roofing': fileURLToPath(new URL('./concepts/roofing/index.html', import.meta.url)),
        'concept-plumbing': fileURLToPath(new URL('./concepts/plumbing/index.html', import.meta.url)),
        start: fileURLToPath(new URL('./start/index.html', import.meta.url)),
        // client mocks — free previews built from /start intakes (noindex)
        'mock-summit-auto': fileURLToPath(new URL('./mock/summit-auto-services/index.html', import.meta.url)),
        'mock-apa-marketing': fileURLToPath(new URL('./mock/apa-marketing/index.html', import.meta.url)),
        mocks: fileURLToPath(new URL('./mocks/index.html', import.meta.url)),
      },
    },
  },
})
