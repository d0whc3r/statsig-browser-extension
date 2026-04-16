import { beforeEach, vi, describe, expect, it } from 'vitest'

import { getUserDetails } from './get-user-details'

const { executeScriptMock } = vi.hoisted(() => ({
  executeScriptMock: vi.fn(),
}))

vi.mock('wxt/browser', () => ({
  browser: {
    scripting: {
      executeScript: executeScriptMock,
    },
  },
}))

describe('user details handler', () => {
  beforeEach(() => {
    executeScriptMock.mockReset()
    vi.restoreAllMocks()
  })

  it('returns the injected user details when the script succeeds', async () => {
    const payload = {
      context: { app: 'dashboard' },
      user: { userID: 'user_123' },
    }

    executeScriptMock.mockResolvedValue([{ result: payload }])

    await expect(getUserDetails(42)).resolves.toEqual(payload)

    expect(executeScriptMock).toHaveBeenCalledWith({
      func: expect.any(Function),
      target: { tabId: 42 },
      world: 'MAIN',
    })
  })

  it('returns undefined when the injected script has no result', async () => {
    executeScriptMock.mockResolvedValue([{ result: undefined }])

    await expect(getUserDetails(7)).resolves.toBeUndefined()
  })

  it('returns undefined for restricted about:blank tabs', async () => {
    executeScriptMock.mockRejectedValue(
      new Error(
        'Cannot access contents of url "about:blank". Extension manifest must request permission to access this host.',
      ),
    )

    await expect(getUserDetails(9)).resolves.toBeUndefined()
  })

  it('logs and returns undefined for unexpected errors', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    executeScriptMock.mockRejectedValue(new Error('Boom'))

    await expect(getUserDetails(10)).resolves.toBeUndefined()

    expect(errorSpy).toHaveBeenCalledWith('Failed to get user details from page', 'Boom')
  })
})
