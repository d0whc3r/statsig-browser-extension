import { fireEvent, render, screen } from '@testing-library/react'

import { ConfirmDialog } from '../../components/common/ConfirmDialog'

describe('ConfirmDialog component', () => {
  const defaultProps = {
    description: 'Test Description',
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Title',
  }

  it('renders correctly when open', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeDefined()
    expect(screen.getByText('Test Description')).toBeDefined()
    expect(screen.getByText('Confirm')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Test Title')).toBeNull()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Confirm'))
    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('uses custom button text', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="No, keep" confirmText="Yes, delete" />)

    expect(screen.getByText('Yes, delete')).toBeDefined()
    expect(screen.getByText('No, keep')).toBeDefined()
  })
})
