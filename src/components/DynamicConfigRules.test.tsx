import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { DynamicConfigRule } from '@/src/types/statsig'

import { DynamicConfigRules } from './DynamicConfigRules'

const useDynamicConfigRules = vi.fn()

vi.mock('@/src/hooks/use-dynamic-config-rules', () => ({
  useDynamicConfigRules: (...args: unknown[]) => useDynamicConfigRules(...args),
}))

const rule = (overrides: Partial<DynamicConfigRule> = {}): DynamicConfigRule => ({
  conditions: [],
  environments: [],
  groupName: 'default',
  id: 'rule-1',
  name: 'Default',
  passPercentage: 100,
  returnValue: { greeting: 'hi' },
  ...overrides,
})

describe('dynamicConfigRules', () => {
  it('shows a spinner while rules are loading', () => {
    useDynamicConfigRules.mockReturnValue({ data: undefined, error: null, isLoading: true })
    const { container } = render(<DynamicConfigRules configId="config-1" />)
    expect(container.querySelector('.animate-spin')).toBeTruthy()
  })

  it('shows an error state when the query fails', () => {
    useDynamicConfigRules.mockReturnValue({ data: undefined, error: new Error('boom'), isLoading: false })
    render(<DynamicConfigRules configId="config-1" />)
    expect(screen.getByText('Failed to load rules')).toBeInTheDocument()
  })

  it('shows an empty state when there are no rules', () => {
    useDynamicConfigRules.mockReturnValue({ data: [], error: null, isLoading: false })
    render(<DynamicConfigRules configId="config-1" />)
    expect(screen.getByText('No rules configured')).toBeInTheDocument()
  })

  it('renders rules with a default badge at 100% pass and secondary otherwise', () => {
    useDynamicConfigRules.mockReturnValue({
      data: [rule(), rule({ id: 'partial', name: 'Partial', passPercentage: 25, returnValue: {} })],
      error: null,
      isLoading: false,
    })
    render(<DynamicConfigRules configId="config-1" />)

    expect(useDynamicConfigRules).toHaveBeenCalledWith('config-1')
    expect(screen.getByText('Default')).toBeInTheDocument()
    expect(screen.getByText('Partial')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })
})
