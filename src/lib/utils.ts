import type { ClassValue } from 'clsx'
import type { IFuseOptions } from 'fuse.js'

import { clsx } from 'clsx'
import Fuse from 'fuse.js'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a fuzzy search function using Fuse.js
 * @param items - Array of items to search through
 * @param keys - Keys to search in (for objects)
 * @param options - Additional Fuse.js options
 * @returns Search function that takes a query string and returns filtered results
 */
export function createFuzzySearch<ItemType>(
  items: ItemType[],
  keys: string[],
  options?: IFuseOptions<ItemType>,
) {
  const fuse = new Fuse(items, {
    distance: 600,
    keys,
    threshold: 0.3,
    ...options,
  })

  return (query: string): ItemType[] => {
    if (!query) {
      return items
    }
    return fuse.search(query).map((result) => result.item)
  }
}

/**
 * Debounce function that delays execution until after wait milliseconds
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<FuncType extends (...args: unknown[]) => unknown>(
  func: FuncType,
  wait: number,
): (...args: Parameters<FuncType>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined

  return function executedFunction(...args: Parameters<FuncType>) {
    const later = () => {
      timeout = undefined
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Filter items by a predicate function
 * @param items - Array of items to filter
 * @param predicate - Filter function
 * @returns Filtered array
 */
export function filterItems<ItemType>(
  items: ItemType[],
  predicate: (item: ItemType) => boolean,
): ItemType[] {
  return items.filter((item) => predicate(item))
}

/**
 * Filter items by multiple criteria
 * @param items - Array of items to filter
 * @param filters - Object with filter criteria
 * @returns Filtered array
 */
export function filterByMultipleCriteria<ItemType extends Record<string, unknown>>(
  items: ItemType[],
  filters: Partial<Record<keyof ItemType, unknown>>,
): ItemType[] {
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined) {
        return true
      }
      if (Array.isArray(value)) {
        return value.includes(item[key])
      }
      return item[key] === value
    }),
  )
}

/**
 * Paginate an array of items
 * @param items - Array of items to paginate
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Object with paginated items and metadata
 */
export function paginate<ItemType>(
  items: ItemType[],
  page: number,
  pageSize: number,
): {
  hasNextPage: boolean
  hasPreviousPage: boolean
  items: ItemType[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
} {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    items: items.slice(startIndex, endIndex),
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
  }
}

/**
 * Get slice of items for current page
 * @param items - Array of items
 * @param page - Current page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Sliced array for current page
 */
export function getPageItems<ItemType>(
  items: ItemType[],
  page: number,
  pageSize: number,
): ItemType[] {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return items.slice(startIndex, endIndex)
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

/**
 * Handle API errors and return a user-friendly message
 * @param error - The error object
 * @returns Error message string
 */
export function handleApiError(error: unknown): string {
  // Check for Wretch error
  if (error && typeof error === 'object' && 'response' in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as { response: Response & { _data?: any }; status: number; message: string }
    const { response } = err
    const data = response._data

    if (data) {
      const msg = getErrorMessageFromResponse({ data, status: err.status })
      if (msg) {
        return msg
      }
    }
    return err.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}
