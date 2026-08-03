import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Standalone build for the APA marketing site (apadigitalmarketing.com).
 * Source lives in ./apa-site; the build regenerates the flat, self-contained
 * ../apa-website deploy folder (index.html + assets/ + img/) so the existing
 * drag-to-Vercel / `vercel --prod` static deploy stays UNCHANGED.
 *
 *   npm run build:apa   (cleans ../apa-website/assets first, then builds)
 *
 * emptyOutDir is false so the repo's .git / README / vercel.json / .gitignore
 * are preserved; the npm script clears the hashed assets/ before each build.
 */
export default defineConfig({
  plugins: [react()],
  root: fileURLToPath(new URL('./apa-site', import.meta.url)),
  base: './',
  build: {
    outDir: fileURLToPath(new URL('../apa-website', import.meta.url)),
    emptyOutDir: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./apa-site/index.html', import.meta.url)),
    },
  },
})
