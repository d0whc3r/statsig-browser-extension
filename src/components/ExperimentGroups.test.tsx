import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { makeExperiment } from '@/src/tests/fixtures/statsig'

import { ExperimentGroups } from './ExperimentGroups'

describe('experimentGroups', () => {
  it('renders allocation, targeting gate, groups, parameters, and metrics', () => {
    render(
      <ExperimentGroups
        experiment={makeExperiment({
          allocation: 80,
          groups: [
            { id: 'control', name: 'Control', parameterValues: {}, size: 50 },
            { id: 'variant', name: 'Variant', parameterValues: { showHero: true }, size: 50 },
          ],
          primaryMetrics: [{ name: 'ctr', type: 'user' }],
          secondaryMetrics: [{ name: 'revenue', type: 'user' }],
          targetingGateID: 'gate-target',
        })}
      />,
    )

    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('gate-target')).toBeInTheDocument()
    expect(screen.getByText('Control')).toBeInTheDocument()
    expect(screen.getByText('Variant')).toBeInTheDocument()
    expect(screen.getByText(/"showHero": true/u)).toBeInTheDocument()
    expect(screen.getByText('ctr')).toBeInTheDocument()
    expect(screen.getByText('revenue')).toBeInTheDocument()
  })

  it('omits optional targeting and metrics sections when they are absent', () => {
    render(
      <ExperimentGroups
        experiment={makeExperiment({
          groups: [{ id: 'only', name: 'Only', parameterValues: {}, size: 100 }],
          targetingGateID: undefined,
        })}
      />,
    )

    expect(screen.queryByText('Targeting Gate')).toBeNull()
    expect(screen.queryByText('Metrics')).toBeNull()
    expect(screen.queryByText('Parameters')).toBeNull()
  })
})
