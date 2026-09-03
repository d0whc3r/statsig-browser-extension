import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FeatureGateRule } from '@/src/types/statsig'

import { FeatureGateRules } from './FeatureGateRules'

const useFeatureGateRules = vi.fn()

vi.mock('@/src/hooks/use-feature-gate-rules', () => ({
  useFeatureGateRules: (...args: unknown[]) => useFeatureGateRules(...args),
}))

const rule = (overrides: Partial<FeatureGateRule> = {}): FeatureGateRule => ({
  baseID: 'base-1',
  conditions: [],
  environments: [],
  id: 'rule-1',
  name: 'Everyone',
  passPercentage: 100,
  ...overrides,
})

describe('featureGateRules', () => {
  it('shows a spinner while rules are loading', () => {
    useFeatureGateRules.mockReturnValue({ data: undefined, error: null, isLoading: true })
    const { container } = render(<FeatureGateRules featureGateId="gate-1" />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows an error state when the query fails', () => {
    useFeatureGateRules.mockReturnValue({ data: undefined, error: new Error('boom'), isLoading: false })
    render(<FeatureGateRules featureGateId="gate-1" />)
    expect(screen.getByText('Failed to load rules')).toBeInTheDocument()
  })

  it('shows an empty state when there are no rules', () => {
    useFeatureGateRules.mockReturnValue({ data: [], error: null, isLoading: false })
    render(<FeatureGateRules featureGateId="gate-1" />)
    expect(screen.getByText('No rules configured')).toBeInTheDocument()
  })

  it('renders a card per rule and uses destructive/default/secondary badges by percentage', () => {
    useFeatureGateRules.mockReturnValue({
      data: [
        rule({ id: 'zero', name: 'Off', passPercentage: 0 }),
        rule({ id: 'full', name: 'On' }),
        rule({ id: 'half', name: 'Half', passPercentage: 50 }),
      ],
      error: null,
      isLoading: false,
    })
    render(<FeatureGateRules featureGateId="gate-1" />)

    expect(useFeatureGateRules).toHaveBeenCalledWith('gate-1')
    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(screen.getByText('On')).toBeInTheDocument()
    expect(screen.getByText('Half')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})
