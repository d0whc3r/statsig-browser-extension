import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  // oxlint-disable-next-line new-cap
  plugins: [WxtVitest(), react()],
  test: {
    clearMocks: true,
    coverage: {
      // Coverage costs ~20% of runtime; CI needs it for Codecov, a local `pnpm test` does not.
      enabled: Boolean(process.env.CI),
      exclude: ['src/tests/**/*', '**/*.d.ts', '**/*.test.ts', '**/*.test.tsx', 'src/components/ui/**/*'],
      include: ['{src,entrypoints}/**/*.{ts,tsx}'],
      reporter: ['text', 'json', 'html'],
    },
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.output/**', 'e2e/**'],
    globals: true,
    mockReset: false,
    // Threads beat the default forks pool by ~20% here; nothing in this suite needs process isolation.
    pool: 'threads',
    reporters: ['dot'],
    restoreMocks: true,
    setupFiles: ['./src/tests/setup.ts'],
    // Must exceed the 5s asyncUtilTimeout set in src/tests/setup.ts, or one slow findBy* eats the whole budget.
    testTimeout: 20_000,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    unstubEnvs: true,
    unstubGlobals: true,
    watch: false,
  },
})
