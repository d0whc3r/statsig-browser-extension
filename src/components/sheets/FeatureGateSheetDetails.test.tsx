import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GateIssue } from '@/src/lib/gate-audit'

import { mockFeatureGates } from '@/src/tests/fixtures/statsig'

import { FeatureGateSheetDetails } from './FeatureGateSheetDetails'

const noTrafficIssues: GateIssue[] = [{ detail: 'Statsig reports 0 checks per hour', key: 'no_traffic' }]

describe('featureGateSheetDetails', () => {
  it('shows a spinner while loading', () => {
    const { container } = render(<FeatureGateSheetDetails isLoading error={null} />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows an error state', () => {
    render(<FeatureGateSheetDetails isLoading={false} error={new Error('boom')} />)
    expect(screen.getByText('Error loading feature gate details')).toBeInTheDocument()
  })

  it('renders tags and description when present', () => {
    render(<FeatureGateSheetDetails isLoading={false} error={null} featureGate={mockFeatureGates[0]} />)
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText('checkout')).toBeInTheDocument()
    expect(screen.getByText(/brand-new shiny checkout/u)).toBeInTheDocument()
  })

  it('renders the cleanup signals of the gate', () => {
    render(
      <FeatureGateSheetDetails
        isLoading={false}
        error={null}
        featureGate={mockFeatureGates[0]}
        issues={noTrafficIssues}
      />,
    )
    expect(screen.getByText('Cleanup signals')).toBeInTheDocument()
    expect(screen.getByText('No traffic')).toBeInTheDocument()
    expect(screen.getByText(/0 checks per hour/u)).toBeInTheDocument()
  })
})
