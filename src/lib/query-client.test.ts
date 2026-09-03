import { describe, expect, it } from 'vitest'

import { queryClient } from './query-client'

describe('queryClient', () => {
  it('uses conservative popup defaults', () => {
    const defaults = queryClient.getDefaultOptions().queries
    expect(defaults?.retry).toBe(1)
    expect(defaults?.refetchOnWindowFocus).toBeFalsy()
    expect(defaults?.staleTime).toBe(5 * 60 * 1000)
    expect(defaults?.gcTime).toBe(10 * 60 * 1000)
  })
})
