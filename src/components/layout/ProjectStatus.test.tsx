import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { ProjectStatus } from './ProjectStatus'

const { setManualProjectMock, setSettingsSheetOpenMock, switchProjectMock } = vi.hoisted(() => ({
  setManualProjectMock: vi.fn(),
  setSettingsSheetOpenMock: vi.fn(),
  switchProjectMock: vi.fn(),
}))

const contextState: Record<string, unknown> = {}
const settingsState: Record<string, unknown> = {}

vi.mock('@/src/hooks/use-projects', () => ({
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
  label: 'Qdrant Cloud',
  origins: [],
  ...overrides,
})

describe('projectStatus component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    contextState.detectedKeys = null
    contextState.manualProjectId = undefined
    contextState.projectMatch = null
    contextState.setManualProject = setManualProjectMock
    settingsState.activeProjectId = 'p1'
    settingsState.projects = [project()]
  })

  it('renders nothing while the page has not been inspected yet', () => {
    contextState.detectedKeys = undefined
    contextState.projectMatch = undefined

    renderWithProviders(<ProjectStatus />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders nothing while no project is configured', () => {
    settingsState.projects = []

    renderWithProviders(<ProjectStatus />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('names the project the page belongs to', () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-a'] }
    contextState.projectMatch = { projectId: 'p1', reason: 'client-key' }

    renderWithProviders(<ProjectStatus />)

    expect(screen.getByRole('button', { name: /Qdrant Cloud · this page/iu })).toBeInTheDocument()
  })

  it('flags a page owned by another Statsig project', () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-other'] }
    contextState.projectMatch = null

    renderWithProviders(<ProjectStatus />)

    expect(screen.getByRole('button', { name: /Other Statsig project/iu })).toBeInTheDocument()
  })

  it('flags that the page could not be checked against any project', () => {
    settingsState.projects = [project({ clientKeys: [] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: ['123'], sdkKeys: [] }
    contextState.projectMatch = null

    renderWithProviders(<ProjectStatus />)

    expect(screen.getByRole('button', { name: /Project not verified/iu })).toBeInTheDocument()
  })

  it('says when the page runs no Statsig SDK', () => {
    renderWithProviders(<ProjectStatus />)

    expect(screen.getByRole('button', { name: /No Statsig on this page/iu })).toBeInTheDocument()
  })

  it('names the project picked by hand instead of the page detection', () => {
    contextState.manualProjectId = 'p1'

    renderWithProviders(<ProjectStatus />)

    expect(screen.getByRole('button', { name: /Qdrant Cloud · picked by hand/iu })).toBeInTheDocument()
  })

  it('switches to a project picked by hand without pinning the site', async () => {
    const { user } = renderWithProviders(<ProjectStatus />)

    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /Qdrant Cloud/iu }))

    expect(setManualProjectMock).toHaveBeenCalledWith('p1')
    expect(switchProjectMock).toHaveBeenCalledWith('p1')
  })

  it('opens the settings sheet from the project menu', async () => {
    const { user } = renderWithProviders(<ProjectStatus />)

    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /Project settings/iu }))

    expect(setSettingsSheetOpenMock).toHaveBeenCalledWith(true)
  })

  it('gives the page detection back when the manual choice is cleared', async () => {
    contextState.manualProjectId = 'p1'

    const { user } = renderWithProviders(<ProjectStatus />)

    await user.click(screen.getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /Back to page detection/iu }))

    expect(setManualProjectMock).toHaveBeenCalledWith(undefined)
  })
})
