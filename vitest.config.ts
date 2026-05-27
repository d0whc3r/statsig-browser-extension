import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  // oxlint-disable-next-line new-cap
  plugins: [WxtVitest(), react()],
  test: {
    clearMocks: true,
    coverage: {
      enabled: true,
      exclude: ['src/tests/**/*', '**/*.d.ts', '**/*.test.ts', '**/*.test.tsx', 'src/components/ui/**/*'],
      include: ['{src,entrypoints}/**/*.{ts,tsx}'],
      reporter: ['text', 'json', 'html'],
    },
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.output/**', 'e2e/**'],
    globals: true,
    mockReset: false,
    restoreMocks: true,
    setupFiles: ['./src/tests/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    unstubEnvs: true,
    unstubGlobals: true,
    watch: false,
  },
})
