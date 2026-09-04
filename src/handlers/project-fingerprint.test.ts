import { beforeEach, vi, describe, expect, it } from 'vitest'

import { djb2 } from '../lib/djb2'
import { fetchClientKeys, fetchGateHashes, fetchProjectFingerprint } from './project-fingerprint'

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    headers: vi.fn(),
    json: vi.fn(),
    url: vi.fn(),
  },
}))

vi.mock(import('@/src/lib/fetcher'), () => ({
  api: apiMock as any,
}))

describe('project fingerprint handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMock.headers.mockReturnValue(apiMock)
    apiMock.url.mockReturnValue(apiMock)
    apiMock.get.mockReturnValue(apiMock)
  })

  it('keeps only the CLIENT keys of the project', async () => {
    apiMock.json.mockResolvedValue({
      data: [
        { key: 'console-1', type: 'CONSOLE' },
        { key: 'secret-1', type: 'SERVER' },
        { key: 'client-1', type: 'CLIENT' },
        { key: 'client-2', type: 'CLIENT' },
      ],
    })

    await expect(fetchClientKeys('console-key')).resolves.toStrictEqual(['client-1', 'client-2'])
    expect(apiMock.headers).toHaveBeenCalledWith({ 'STATSIG-API-KEY': 'console-key' })
    expect(apiMock.url).toHaveBeenCalledWith('/keys?limit=100')
  })

  it('returns no client keys when the Console key lacks the can_access_keys scope', async () => {
    apiMock.json.mockRejectedValue(new Error('Forbidden'))

    await expect(fetchClientKeys('console-key')).resolves.toStrictEqual([])
  })

  it('hashes the gate names so the page payload can be fingerprinted', async () => {
    apiMock.json.mockResolvedValue({ data: [{ id: 'a_gate' }, { name: 'other_gate' }, {}] })

    await expect(fetchGateHashes('console-key')).resolves.toStrictEqual([djb2('a_gate'), djb2('other_gate')])
    expect(apiMock.url).toHaveBeenCalledWith('/gates?limit=100')
  })

  it('returns no gate hashes when the request fails', async () => {
    apiMock.json.mockRejectedValue(new Error('Unauthorized'))

    await expect(fetchGateHashes('console-key')).resolves.toStrictEqual([])
  })

  it('skips the gate fingerprint when client keys are available', async () => {
    apiMock.json.mockResolvedValue({ data: [{ key: 'client-1', type: 'CLIENT' }] })

    await expect(fetchProjectFingerprint('console-key')).resolves.toStrictEqual({
      clientKeys: ['client-1'],
      gateHashes: [],
    })
    expect(apiMock.url).toHaveBeenCalledTimes(1)
  })

  it('falls back to the gate fingerprint when no client key is readable', async () => {
    apiMock.json.mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce({ data: [{ id: 'a_gate' }] })

    await expect(fetchProjectFingerprint('console-key')).resolves.toStrictEqual({
      clientKeys: [],
      gateHashes: [djb2('a_gate')],
    })
  })

  it('handles an empty response body', async () => {
    apiMock.json.mockResolvedValue({})

    await expect(fetchProjectFingerprint('console-key')).resolves.toStrictEqual({ clientKeys: [], gateHashes: [] })
  })
})
