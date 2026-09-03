import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUIStore } from '@/src/store/use-ui-store'
import { mockDynamicConfigs } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { DynamicConfigSheet } from './DynamicConfigSheet'

const useDynamicConfig = vi.fn()

vi.mock('@/src/hooks/use-dynamic-config', () => ({
  useDynamicConfig: (...args: unknown[]) => useDynamicConfig(...args),
}))

vi.mock('@/src/hooks/use-dynamic-config-rules', () => ({
  useDynamicConfigRules: () => ({ data: [], error: null, isLoading: false }),
}))

describe('dynamicConfigSheet', () => {
  beforeEach(() => {
    useDynamicConfig.mockReset()
    useUIStore.setState({
      currentItemId: 'config-banner',
      currentItemType: 'dynamic_config',
      isItemSheetOpen: true,
    })
  })

  it('renders config details, default value, and the Statsig link', () => {
    useDynamicConfig.mockReturnValue({ data: mockDynamicConfigs[0], error: null, isLoading: false })
    renderWithProviders(<DynamicConfigSheet />)

    expect(screen.getByText('homepage_banner_config')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('Default Value')).toBeInTheDocument()
    expect(screen.getByText(/"greeting": "Hello"/u)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /statsig/iu })).toHaveAttribute(
      'href',
      'https://console.statsig.com/dynamic_configs/config-banner',
    )
  })

  it('shows loading skeletons and an error message', () => {
    useDynamicConfig.mockReturnValue({ data: undefined, error: null, isLoading: true })
    const { rerender } = renderWithProviders(<DynamicConfigSheet />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)

    useDynamicConfig.mockReturnValue({ data: undefined, error: new Error('nope'), isLoading: false })
    rerender(<DynamicConfigSheet />)
    expect(screen.getByText(/Failed to load config details: nope/u)).toBeInTheDocument()
  })
})
