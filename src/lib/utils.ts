import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403
const HTTP_NOT_FOUND = 404
const HTTP_SERVER_ERROR = 500

const ERROR_MESSAGES: Record<number, string> = {
  [HTTP_UNAUTHORIZED]: 'Invalid API Key. Please check your settings.',
  [HTTP_FORBIDDEN]: 'You do not have permission to perform this action.',
  [HTTP_NOT_FOUND]: 'The requested resource was not found.',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getErrorMessageFromResponse(response: any): string | undefined {
  const { status } = response

  if (status in ERROR_MESSAGES) {
    return ERROR_MESSAGES[status]
  }

  if (status >= HTTP_SERVER_ERROR) {
    return 'Server error. Please try again later.'
  }

  const data = response.data as { message?: string; error?: string } | undefined
  return data?.message || data?.error
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isWretchError(
  error: unknown,
): error is { response: Response & { _data?: any }; status: number; message: string } {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

/**
 * Handle API errors and return a user-friendly message
 * @param error - The error object
 * @returns Error message string
 */
export function handleApiError(error: unknown): string {
  if (isWretchError(error)) {
    const data = error.response._data

    if (data) {
      const msg = getErrorMessageFromResponse({ data, status: error.status })
      if (msg) {
        return msg
      }
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}
