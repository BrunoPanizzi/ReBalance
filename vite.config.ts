import { reactRouter } from '@react-router/dev/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { reactRouterHonoServer } from 'react-router-hono-server/dev'
import { defineConfig } from 'vite'

export default defineConfig({
  build: { sourcemap: false },
  plugins: [
    reactRouterHonoServer({ runtime: 'aws', dev: { export: 'handler' } }),
    reactRouter(),
    tsConfigPaths(),
  ],
})
