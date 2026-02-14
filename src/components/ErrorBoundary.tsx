import type { ErrorInfo, ReactNode } from 'react'

import React, { Component } from 'react'

import { Button } from '@/src/components/ui/button'

interface Props {
  children?: ReactNode
}

interface State {
  error: Error | undefined
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  // eslint-disable-next-line react/state-in-constructor
  public state: State = {
    error: undefined,
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    // eslint-disable-next-line react/no-set-state
    this.setState({ error: undefined, hasError: false })
    globalThis.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">Something went wrong</h2>
          <p className="mb-6 text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.handleReload}>Reload Extension</Button>
        </div>
      )
    }

    return this.props.children
  }
}
