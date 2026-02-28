import type { RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'

import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

export function TestProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return {
    queryClient,
    user: userEvent.setup({ pointerEventsCheck: 0 }),
    ...render(<TestProviders>{ui}</TestProviders>, options),
  }
}

export * from '@testing-library/react'
