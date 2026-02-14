// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock Chrome API
globalThis.chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
    id: 'test-id',
  },
  scripting: {
    executeScript: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
} as unknown as typeof chrome
