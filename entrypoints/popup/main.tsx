import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { TooltipProvider } from '@/src/components/ui/tooltip'
import { queryClient } from '@/src/lib/query-client.ts'
import '@fontsource/inter'
import { App } from './App'

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
