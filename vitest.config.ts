import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'

export default defineConfig({
  // eslint-disable-next-line new-cap
  plugins: [WxtVitest(), react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    watch: false,
  },
})
