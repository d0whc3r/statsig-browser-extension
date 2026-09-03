import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HypothesisSection } from './HypothesisSection'

describe('hypothesisSection', () => {
  it('renders the provided hypothesis', () => {
    render(<HypothesisSection hypothesis="Users click more." />)
    expect(screen.getByText('Hypothesis')).toBeInTheDocument()
    expect(screen.getByText('Users click more.')).toBeInTheDocument()
  })

  it('falls back when hypothesis is missing', () => {
    render(<HypothesisSection />)
    expect(screen.getByText('Hypothesis not set.')).toBeInTheDocument()
  })
})
