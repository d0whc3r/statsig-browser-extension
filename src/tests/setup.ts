// oxlint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Lazy-loaded sheets/modals (see GlobalModals) resolve their chunk asynchronously.
// Under full-suite parallel load the default 1000ms async timeout is not enough for
// The chunk to import and render, causing flaky "Unable to find" failures. Raise it.
configure({ asyncUtilTimeout: 5000 })

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

const browserMock = {
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
}

const root = globalThis as typeof globalThis & { browser?: typeof browserMock }

if (typeof root.browser === 'object' && root.browser !== null) {
  Object.assign(root.browser, browserMock)
} else {
  Object.defineProperty(globalThis, 'browser', {
    configurable: true,
    value: browserMock,
    writable: true,
  })
}

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // No-op: jsdom does not implement ResizeObserver
  }
  unobserve() {
    // No-op: jsdom does not implement ResizeObserver
  }
  disconnect() {
    // No-op: jsdom does not implement ResizeObserver
  }
}

const createMatchMediaResult = (query: string) =>
  ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
  }) satisfies Partial<MediaQueryList>

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => createMatchMediaResult(query)),
  writable: true,
})

// Mock PointerEvents if needed (jsdom doesn't support them well)
// But usually Radix works with userEvent which dispatches pointer events.
// However, setPointerCapture is often missing.
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
Element.prototype.hasPointerCapture = vi.fn()
