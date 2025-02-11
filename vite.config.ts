import { reactRouter } from '@react-router/dev/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRouter(), tsConfigPaths()],
  optimizeDeps: { entries: ['./app/root.tsx'] },
})
