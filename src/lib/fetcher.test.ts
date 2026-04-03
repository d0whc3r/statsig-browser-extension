import { API_BASE_URL, fetcher, poster } from './fetcher'

const { sendMessageMock } = vi.hoisted(() => ({
  sendMessageMock: vi.fn(),
}))

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      sendMessage: sendMessageMock,
    },
  },
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

    await expect(fetcher<{ ok: boolean }>('/feature-gates')).resolves.toEqual({ ok: true })

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

    await expect(poster<{ created: boolean }>('/overrides', { id: 'gate_1' })).resolves.toEqual({
      created: true,
    })

    expect(sendMessageMock).toHaveBeenCalledTimes(1)
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          method: 'POST',
          url: `${API_BASE_URL}/overrides`,
        }),
        type: 'API_REQUEST',
      }),
    )
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

    await expect(fetcher<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true })
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
})
