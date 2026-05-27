import { beforeEach, vi, describe, expect, it } from 'vitest'

import { API_BASE_URL, fetcher, poster } from './fetcher'

const { sendMessageMock } = vi.hoisted(() => ({
  sendMessageMock: vi.fn(),
}))

vi.mock(import('wxt/browser'), async (importOriginal) => ({
  ...(await importOriginal()),
  browser: {
    runtime: {
      sendMessage: sendMessageMock,
    },
  } as any,
}))

describe('custom fetch bridge', () => {
  beforeEach(() => {
    sendMessageMock.mockReset()
  })

  it('fetches JSON data through the background script', async () => {
    sendMessageMock.mockResolvedValue({
      response: {
        data: { ok: true },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK',
      },
      success: true,
    })

    await expect(fetcher<{ ok: boolean }>('/feature-gates')).resolves.toStrictEqual({ ok: true })

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith({
      config: {
        body: undefined,
        headers: undefined,
        method: 'GET',
        url: `${API_BASE_URL}/feature-gates`,
      },
      type: 'API_REQUEST',
    })
  })

  it('posts data through the background script', async () => {
    sendMessageMock.mockResolvedValue({
      response: {
        data: { created: true },
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK',
      },
      success: true,
    })

    await expect(poster<{ created: boolean }>('/overrides', { id: 'gate_1' })).resolves.toStrictEqual({
      created: true,
    })

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    const [[callArg]] = sendMessageMock.mock.calls
    expect(callArg).toMatchObject({
      config: {
        method: 'POST',
        url: `${API_BASE_URL}/overrides`,
      },
      type: 'API_REQUEST',
    })
    // oxlint-disable-next-line typescript/no-unsafe-argument, typescript/no-unsafe-member-access
    expect(JSON.parse(callArg.config.body)).toStrictEqual({ id: 'gate_1' })
  })

  it('parses string response payloads from the background script', async () => {
    sendMessageMock.mockResolvedValue({
      response: {
        data: JSON.stringify({ ok: true }),
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK',
      },
      success: true,
    })

    await expect(fetcher<{ ok: boolean }>('/health')).resolves.toStrictEqual({ ok: true })
  })

  it('throws when the background response shape is invalid', async () => {
    sendMessageMock.mockResolvedValue({ invalid: true })

    await expect(fetcher('/invalid')).rejects.toThrow('Invalid response from background script')
  })

  it('throws the background error when the request fails', async () => {
    sendMessageMock.mockResolvedValue({
      error: 'Forbidden',
      success: false,
    })

    await expect(fetcher('/forbidden')).rejects.toThrow('Forbidden')
  })

  it('handles non-JSON content types correctly', async () => {
    // The fetcher returns the data as-is when it's already an object
    sendMessageMock.mockResolvedValue({
      response: {
        data: { message: 'plain text response' },
        headers: { 'content-type': 'text/plain' },
        status: 200,
        statusText: 'OK',
      },
      success: true,
    })

    // The fetcher will return the parsed data object
    await expect(fetcher('/plain')).resolves.toStrictEqual({ message: 'plain text response' })
  })

  it('handles empty data field', async () => {
    sendMessageMock.mockResolvedValue({
      response: {
        data: null,
        headers: { 'content-type': 'application/json' },
        status: 204,
        statusText: 'No Content',
      },
      success: true,
    })

    await expect(fetcher('/no-content')).resolves.toBeNull()
  })

  it('handles array response payloads', async () => {
    sendMessageMock.mockResolvedValue({
      response: {
        data: [{ id: 1 }, { id: 2 }],
        headers: { 'content-type': 'application/json' },
        status: 200,
        statusText: 'OK',
      },
      success: true,
    })

    await expect(fetcher<{ id: number }[]>('/list')).resolves.toStrictEqual([{ id: 1 }, { id: 2 }])
  })
})
