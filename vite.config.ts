import { vitePlugin as remix } from '@remix-run/dev'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_singleFetch: true,
      },
    }),
    tsConfigPaths(),
  ],
  optimizeDeps: { entries: ['./app/root.tsx'] },
})
