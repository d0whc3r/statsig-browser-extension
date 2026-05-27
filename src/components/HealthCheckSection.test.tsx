import { TooltipProvider } from '@radix-ui/react-tooltip'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { HealthCheck } from '@/src/types/statsig'

import { HealthCheckSection } from './HealthCheckSection'

const renderSection = (healthChecks?: HealthCheck[]) =>
  render(
    <TooltipProvider>
      <HealthCheckSection healthChecks={healthChecks} />
    </TooltipProvider>,
  )

describe('healthCheckSection', () => {
  it('renders nothing when there are no health checks', () => {
    const { container } = renderSection()
    expect(container).toBeEmptyDOMElement()

    const { container: emptyContainer } = renderSection([])
    expect(emptyContainer).toBeEmptyDOMElement()
  })

  it('computes 100% when all checks pass', () => {
    renderSection([
      { description: 'a', name: 'check_a', status: 'PASSED' },
      { description: 'b', name: 'check_b', status: 'PASSED' },
    ])
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('check_a')).toBeInTheDocument()
    expect(screen.getByText('check_b')).toBeInTheDocument()
  })

  it('computes partial progress when some checks are waiting', () => {
    renderSection([
      { description: 'a', name: 'check_a', status: 'PASSED' },
      { description: 'b', name: 'check_b', status: 'WAITING' },
      { description: 'c', name: 'check_c', status: 'PASSED' },
      { description: 'd', name: 'check_d', status: 'WAITING' },
    ])
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders 0% when no checks pass', () => {
    renderSection([{ description: 'a', name: 'only_check', status: 'WAITING' }])
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
