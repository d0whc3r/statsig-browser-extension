import { describe, expect, it } from 'vitest'

import { cn, handleApiError } from './utils'

describe('shared library helpers', () => {
  it('merges class names with tailwind precedence', () => {
    expect(cn('px-2', undefined, false, 'px-4', 'text-sm')).toBe('px-4 text-sm')
  })

  it('maps known HTTP statuses to friendly API messages', () => {
    expect(
      handleApiError({
        message: 'Unauthorized',
        response: { _data: { message: 'ignored' } },
        status: 401,
      }),
    ).toBe('Invalid API Key. Please check your settings.')

    expect(
      handleApiError({
        message: 'Forbidden',
        response: { _data: { error: 'ignored' } },
        status: 403,
      }),
    ).toBe('You do not have permission to perform this action.')

    expect(
      handleApiError({
        message: 'Not Found',
        response: { _data: { message: 'ignored' } },
        status: 404,
      }),
    ).toBe('The requested resource was not found.')
  })

  it('returns a generic server error for 5xx responses', () => {
    expect(
      handleApiError({
        message: 'Internal Server Error',
        response: { _data: { message: 'backend exploded' } },
        status: 500,
      }),
    ).toBe('Server error. Please try again later.')
  })

  it('returns API payload messages when a mapped status does not apply', () => {
    expect(
      handleApiError({
        message: 'Conflict',
        response: { _data: { message: 'Duplicate override' } },
        status: 409,
      }),
    ).toBe('Duplicate override')

    expect(
      handleApiError({
        message: 'Bad Request',
        response: { _data: { error: 'Malformed payload' } },
        status: 400,
      }),
    ).toBe('Malformed payload')
  })

  it('falls back to the original error message when no payload message exists', () => {
    expect(
      handleApiError({
        message: 'Request failed',
        response: { _data: 'not-an-object' },
        status: 422,
      }),
    ).toBe('Request failed')
  })

  it('returns native error messages and unknown fallbacks', () => {
    expect(handleApiError(new Error('Boom'))).toBe('Boom')
    expect(handleApiError(null)).toBe('An unknown error occurred')
  })
})
