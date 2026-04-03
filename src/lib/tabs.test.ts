import { getActiveTab } from './tabs'

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}))

vi.mock('wxt/browser', () => ({
  browser: {
    tabs: {
      query: queryMock,
    },
  },
}))

describe('active tab lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the current window active tab when available', async () => {
    const tab = { id: 1, url: 'https://example.com' }
    queryMock.mockResolvedValueOnce([tab])

    await expect(getActiveTab()).resolves.toEqual(tab)
    expect(queryMock).toHaveBeenCalledTimes(1)
    expect(queryMock).toHaveBeenCalledWith({ active: true, currentWindow: true })
  })

  it('falls back to any active tab when the current window has none', async () => {
    const fallbackTab = { id: 2, url: 'https://fallback.com' }
    queryMock.mockResolvedValueOnce([])
    queryMock.mockResolvedValueOnce([fallbackTab])

    await expect(getActiveTab()).resolves.toEqual(fallbackTab)
    expect(queryMock).toHaveBeenNthCalledWith(1, { active: true, currentWindow: true })
    expect(queryMock).toHaveBeenNthCalledWith(2, { active: true })
  })

  it('returns undefined when no active tabs are found', async () => {
    queryMock.mockResolvedValueOnce([])
    queryMock.mockResolvedValueOnce([])

    await expect(getActiveTab()).resolves.toBeUndefined()
  })

  it('logs and returns undefined when querying tabs fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('tabs.query failed')

    queryMock.mockRejectedValue(error)

    await expect(getActiveTab()).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith('[Statsig Extension] Failed to get active tab:', error)
  })
})
