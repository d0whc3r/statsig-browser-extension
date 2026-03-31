import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  // eslint-disable-next-line new-cap
  plugins: [WxtVitest(), react()],
  test: {
    coverage: {
      enabled: true,
      exclude: ['src/tests/**/*'],
      include: ['{src,entrypoints}/**/*.{ts,tsx}'],
    },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    watch: false,
  },
})
