// oxlint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

const chromeMock = {
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

Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
})

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const createMatchMediaResult = (query: string): MediaQueryList => ({
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
})

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => createMatchMediaResult(query)),
  writable: true,
})

// Mock PointerEvents if needed (jsdom doesn't support them well)
// But usually Radix works with userEvent which dispatches pointer events.
// However, setPointerCapture is often missing.
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
Element.prototype.hasPointerCapture = vi.fn()
