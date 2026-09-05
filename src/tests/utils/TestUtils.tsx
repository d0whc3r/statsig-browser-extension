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

/**
 * Renders inside an async `act`, so the promises settled during mount stay in the act scope.
 * `useActiveTabOrigin` sets state from a `then()` that resolves one microtask after the *synchronous*
 * `act` of a plain `render`/`renderHook` has already closed — flushing afterwards is too late and
 * React still warns "An update to ... was not wrapped in act(...)".
 */
export async function renderInAct<T>(renderFn: () => T): Promise<T> {
  // oxlint-disable-next-line init-declarations -- assigned inside the act scope below
  let rendered!: T

  // The `async` callback and the `await` are both load-bearing: they make `act` flush the mount
  // Promises. A synchronous callback closes the scope too early and the warning comes back.
  // oxlint-disable-next-line require-await, typescript/require-await
  await act(async () => {
    rendered = renderFn()
  })

  return rendered
}

export * from '@testing-library/react'
