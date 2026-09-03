import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  EntityDetailsContainer,
  EntityDetailsField,
  EntityDetailsList,
  EntityDetailsSection,
  EntityDetailsTags,
} from './EntityDetails'

const EMPTY_TAGS: string[] = []
const SAMPLE_TAGS = ['checkout', 'frontend']

describe('entityDetails', () => {
  it('renders container, labeled fields, and sections', () => {
    render(
      <EntityDetailsContainer>
        <EntityDetailsList>
          <EntityDetailsField label="Status">Active</EntityDetailsField>
          <EntityDetailsField>Unlabeled</EntityDetailsField>
        </EntityDetailsList>
        <EntityDetailsSection title="Notes">Hello</EntityDetailsSection>
      </EntityDetailsContainer>,
    )

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Unlabeled')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders nothing for empty tags and badges for present tags', () => {
    const { rerender } = render(<EntityDetailsTags />)
    expect(screen.queryByText('checkout')).toBeNull()

    rerender(<EntityDetailsTags tags={EMPTY_TAGS} />)
    expect(screen.queryByText('checkout')).toBeNull()

    rerender(<EntityDetailsTags tags={SAMPLE_TAGS} />)
    expect(screen.getByText('checkout')).toBeInTheDocument()
    expect(screen.getByText('frontend')).toBeInTheDocument()
  })
})
