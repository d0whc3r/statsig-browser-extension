import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockFeatureGates } from '@/src/tests/fixtures/statsig'

import { FeatureGateSheetDetails } from './FeatureGateSheetDetails'

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
})
