import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RuleCard } from './RuleCard'

const baseRule = {
  conditions: [{ operator: 'any', targetValue: ['u_1', 'u_2'], type: 'user_id' }],
  environments: ['production', 'staging'],
  id: 'rule-1',
  name: 'Checkout cohort',
  passPercentage: 50,
}

describe('ruleCard', () => {
  it('renders name, percentage, environments, and formatted conditions', () => {
    render(<RuleCard rule={baseRule} passBadgeVariant="secondary" />)

    expect(screen.getByText('Checkout cohort')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('production')).toBeInTheDocument()
    expect(screen.getByText('staging')).toBeInTheDocument()
    expect(screen.getByText(/User ID any/u)).toBeInTheDocument()
    expect(screen.getByText(/rule_id: rule-1/u)).toBeInTheDocument()
  })

  it('shows the base rule id and group name when they differ from the rule id', () => {
    render(
      <RuleCard
        passBadgeVariant="default"
        rule={{ ...baseRule, baseID: 'base-9', conditions: [], environments: [], groupName: 'Holdout' }}
      />,
    )

    expect(screen.getByText(/base_rule_id: base-9/u)).toBeInTheDocument()
    expect(screen.getByText('Holdout')).toBeInTheDocument()
    expect(screen.queryByText('Environments')).toBeNull()
    expect(screen.queryByText('Conditions')).toBeNull()
  })

  it('keeps very long conditions inside the card bounds', () => {
    const longIds = Array.from({ length: 60 }, (_value, index) => `user_id_value_${index}`)

    render(
      <RuleCard
        passBadgeVariant="secondary"
        rule={{ ...baseRule, conditions: [{ operator: 'any_of', targetValue: longIds, type: 'user_id' }] }}
      />,
    )

    const badge = screen.getByText(/User ID any_of/u)

    expect(badge.className).toContain('max-w-full')
    expect(badge.className).toContain('whitespace-normal')
    expect(badge.className).toContain('break-words')
    expect(badge).toHaveAttribute('title', expect.stringContaining('user_id_value_59'))
  })

  it('renders a return value block when present', () => {
    render(<RuleCard passBadgeVariant="default" rule={{ ...baseRule, returnValue: { greeting: 'hello' } }} />)

    expect(screen.getByText('Return Value')).toBeInTheDocument()
    expect(screen.getByText(/"greeting": "hello"/u)).toBeInTheDocument()
  })
})
