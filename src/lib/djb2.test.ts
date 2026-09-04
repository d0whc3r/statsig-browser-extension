import { describe, expect, it } from 'vitest'

import { djb2 } from './djb2'

describe('djb2', () => {
  it('matches the hashes Statsig reports as hashed_sdk_key_used', () => {
    // Verified against live pages: cloud.qdrant.io and statsig.com
    expect(djb2('client-azDVKQnE5MmDj3YmdCGS6RFSZcTPYE0J4Hxj3qaREEu')).toBe('2447027979')
    expect(djb2('client-XlqSMkAavOmrePNeWfD0fo2cWcjxkZ0cJZz64w7bfHX')).toBe('2414204405')
  })

  it('hashes an empty string to zero', () => {
    expect(djb2('')).toBe('0')
  })

  it('is stable and case sensitive', () => {
    expect(djb2('a_gate_name')).toBe(djb2('a_gate_name'))
    expect(djb2('a_gate_name')).not.toBe(djb2('A_Gate_Name'))
  })
})
