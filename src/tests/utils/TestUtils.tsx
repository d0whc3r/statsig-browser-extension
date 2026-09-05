import type { RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { TooltipProvider } from '@/src/components/ui/tooltip'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

function TestProviders({
  children,
  queryClient: externalQueryClient,
}: Readonly<{
  children: ReactNode
  queryClient?: QueryClient
}>) {
  // oxlint-disable-next-line react/hook-use-state
  const [queryClient] = React.useState(() => externalQueryClient ?? createTestQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  const queryClient = createTestQueryClient()

  return {
    queryClient,
    user: userEvent.setup({ pointerEventsCheck: 0 }),
    ...render(<TestProviders queryClient={queryClient}>{ui}</TestProviders>, options),
  }
}

/** Flush pending async effects (microtask-resolved state updates) inside act(...). */
export const flushEffects = () => act(async () => {})

export * from '@testing-library/react'
