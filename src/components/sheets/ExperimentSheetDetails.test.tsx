import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TooltipProvider } from '@/src/components/ui/tooltip'
import { makeExperiment } from '@/src/tests/fixtures/statsig'

import { ExperimentSheetDetails } from './ExperimentSheetDetails'

const renderDetails = (props: { isLoading: boolean; error: unknown; experiment?: ReturnType<typeof makeExperiment> }) =>
  render(
    <TooltipProvider>
      <ExperimentSheetDetails {...props} />
    </TooltipProvider>,
  )

describe('experimentSheetDetails', () => {
  it('shows skeletons while loading', () => {
    const { container } = renderDetails({ error: null, isLoading: true })
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('shows an Error message and a fallback for unknown errors', () => {
    renderDetails({ error: new Error('timeout'), isLoading: false })
    expect(screen.getByText(/Failed to load experiment details: timeout/u)).toBeInTheDocument()
  })

  it('renders tags, description, health checks, and hypothesis', () => {
    renderDetails({
      error: null,
      experiment: makeExperiment({
        description: 'Reorder the hero.',
        healthChecks: [{ description: 'ok', name: 'check_a', status: 'PASSED' }],
        hypothesis: 'CTR goes up.',
        tags: ['homepage'],
      }),
      isLoading: false,
    })

    expect(screen.getByText('homepage')).toBeInTheDocument()
    expect(screen.getByText('Reorder the hero.')).toBeInTheDocument()
    expect(screen.getByText('check_a')).toBeInTheDocument()
    expect(screen.getByText('CTR goes up.')).toBeInTheDocument()
  })

  it('uses a fallback message for non-Error failures', () => {
    renderDetails({ error: 'nope', isLoading: false })
    expect(screen.getByText(/Unknown error/u)).toBeInTheDocument()
  })

  it('returns nothing when there is no experiment', () => {
    const { container } = renderDetails({ error: null, isLoading: false })
    expect(container).toBeEmptyDOMElement()
  })
})
