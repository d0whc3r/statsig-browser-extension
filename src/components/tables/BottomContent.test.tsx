import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { BottomContent } from './BottomContent'

const noop = () => {}

const Harness = ({ initialPage = 1, total }: { initialPage?: number; total: number }) => {
  const [page, setPage] = useState(initialPage)
  return (
    <>
      <div data-testid="current-page">{page}</div>
      <BottomContent page={page} setPage={setPage} total={total} />
    </>
  )
}

describe('bottomContent', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<BottomContent page={1} setPage={noop} total={1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('disables the previous button on the first page', () => {
    render(<BottomContent page={1} setPage={noop} total={5} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
    expect(buttons.at(-1)).not.toBeDisabled()
  })

  it('disables the next button on the last page', () => {
    render(<BottomContent page={5} setPage={noop} total={5} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.at(-1)).toBeDisabled()
    expect(buttons[0]).not.toBeDisabled()
  })

  it('advances and rewinds via next/previous arrows', async () => {
    const user = userEvent.setup()
    render(<Harness initialPage={2} total={5} />)

    const buttons = screen.getAllByRole('button')
    const [prev] = buttons
    const next = buttons.at(-1)!

    await user.click(next)
    expect(screen.getByTestId('current-page')).toHaveTextContent('3')

    await user.click(prev)
    expect(screen.getByTestId('current-page')).toHaveTextContent('2')
  })

  it('jumps to a specific page when clicking a page number', async () => {
    const user = userEvent.setup()
    render(<Harness total={5} />)

    await user.click(screen.getByRole('button', { name: '4' }))
    expect(screen.getByTestId('current-page')).toHaveTextContent('4')
  })

  it('caps the visible page window to five entries', () => {
    render(<BottomContent page={6} setPage={noop} total={20} />)
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '3' })).toBeNull()
    expect(screen.queryByRole('button', { name: '9' })).toBeNull()
  })

  it('clamps the window against the last page', () => {
    render(<BottomContent page={20} setPage={noop} total={20} />)
    expect(screen.getByRole('button', { name: '16' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '15' })).toBeNull()
  })
})
