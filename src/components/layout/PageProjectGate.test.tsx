import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { initialLogin } from '@/src/handlers/initial-login'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { PageProjectGate } from './PageProjectGate'

const { addProjectMock, setManualProjectMock, setSettingsSheetOpenMock, switchProjectMock } = vi.hoisted(() => ({
  addProjectMock: vi.fn(),
  setManualProjectMock: vi.fn(),
  setSettingsSheetOpenMock: vi.fn(),
  switchProjectMock: vi.fn(),
}))

const contextState: Record<string, unknown> = {}
const settingsState: Record<string, unknown> = {}

vi.mock(import('@/src/handlers/initial-login'), () => ({
  initialLogin: vi.fn(),
}))

vi.mock('@/src/hooks/use-active-tab-origin', () => ({
  useActiveTabOrigin: () => 'https://app.example.com',
}))

vi.mock('@/src/hooks/use-projects', () => ({
  useAddProject: () => addProjectMock,
  useSwitchProject: () => switchProjectMock,
}))

vi.mock('@/src/store/use-context-store', () => ({
  useContextStore: (selector: (state: unknown) => unknown) => selector(contextState),
}))

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) => selector(settingsState),
}))

vi.mock('@/src/store/use-ui-store', () => ({
  useUIStore: (selector: (state: unknown) => unknown) => selector({ setSettingsSheetOpen: setSettingsSheetOpenMock }),
}))

const project = (overrides: Partial<StatsigProject> = {}): StatsigProject => ({
  apiKey: 'console-a',
  clientKeys: ['client-a'],
  gateHashes: [],
  id: 'p1',
  label: 'Project 1',
  origins: [],
  ...overrides,
})

describe('pageProjectGate component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addProjectMock.mockResolvedValue('p9')
    contextState.detectedKeys = null
    contextState.manualProjectId = undefined
    contextState.projectMatch = null
    contextState.setManualProject = setManualProjectMock
    settingsState.activeProjectId = 'p1'
    settingsState.projects = [project()]
  })

  it('renders nothing while no project is configured, so the login modal owns the screen', () => {
    settingsState.projects = []

    renderWithProviders(<PageProjectGate />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('waits for the page detection instead of claiming the project is unknown', () => {
    contextState.detectedKeys = undefined
    contextState.projectMatch = undefined

    renderWithProviders(<PageProjectGate />)

    expect(screen.getByText(/Checking which Statsig project/iu)).toBeInTheDocument()
    expect(screen.queryByLabelText('Statsig Console API Key')).not.toBeInTheDocument()
  })

  it('names the detected key of a page owned by another project and loads nothing', () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-other'] }

    renderWithProviders(<PageProjectGate />)

    expect(screen.getByText(/belongs to another Statsig project/iu)).toBeInTheDocument()
    expect(screen.getByText(/client-other/u)).toBeInTheDocument()
    expect(screen.getByText(/Nothing is loaded/iu)).toBeInTheDocument()
  })

  it('explains a page without Statsig', () => {
    renderWithProviders(<PageProjectGate />)

    expect(screen.getByText(/No Statsig SDK on this page/iu)).toBeInTheDocument()
    expect(screen.getAllByText(/app\.example\.com/u).length).toBeGreaterThan(0)
  })

  it('pins the site to the project added from the gate', async () => {
    vi.mocked(initialLogin).mockResolvedValue({ data: undefined, error: undefined, success: true })
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-other'] }

    const { user } = renderWithProviders(<PageProjectGate />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'console-new')
    await user.click(screen.getByRole('button', { name: /^Add$/iu }))

    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith('console-new', true)
    })
  })

  it('accepts the key of an already configured project to pin the site to it', async () => {
    vi.mocked(initialLogin).mockResolvedValue({ data: undefined, error: undefined, success: true })

    const { user } = renderWithProviders(<PageProjectGate />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'console-a')
    await user.click(screen.getByRole('button', { name: /^Add$/iu }))

    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith('console-a', true)
    })
    expect(screen.queryByText('That project is already configured')).not.toBeInTheDocument()
  })

  it('lets the user manage one of their projects on a page that does not use it', async () => {
    const { user } = renderWithProviders(<PageProjectGate />)

    await user.click(screen.getByRole('button', { name: /Switch to one of my projects/iu }))
    await user.click(await screen.findByRole('menuitem', { name: /Project 1/iu }))

    expect(setManualProjectMock).toHaveBeenCalledWith('p1')
    expect(switchProjectMock).toHaveBeenCalledWith('p1')
    expect(setSettingsSheetOpenMock).not.toHaveBeenCalled()
  })
})
