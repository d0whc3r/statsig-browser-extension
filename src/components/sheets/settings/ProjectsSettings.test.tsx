import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StatsigProject } from '@/src/lib/projects'

import { initialLogin } from '@/src/handlers/initial-login'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { ProjectsSettings } from './ProjectsSettings'

const { addProjectMock, refreshProjectMock, removeProjectMock, switchProjectMock, updateProjectMock } = vi.hoisted(
  () => ({
    addProjectMock: vi.fn(),
    refreshProjectMock: vi.fn(),
    removeProjectMock: vi.fn(),
    switchProjectMock: vi.fn(),
    updateProjectMock: vi.fn(),
  }),
)

const contextState: Record<string, unknown> = {}
const settingsState: Record<string, unknown> = {}

vi.mock(import('@/src/handlers/initial-login'), () => ({
  initialLogin: vi.fn(),
}))

vi.mock('@/src/hooks/use-projects', () => ({
  useAddProject: () => addProjectMock,
  useRefreshProject: () => refreshProjectMock,
  useSwitchProject: () => switchProjectMock,
}))

vi.mock('@/src/store/use-context-store', () => ({
  useContextStore: (selector: (state: unknown) => unknown) => selector(contextState),
}))

vi.mock('@/src/store/use-settings-store', () => ({
  useSettingsStore: (selector: (state: unknown) => unknown) => selector(settingsState),
}))

const project = (overrides: Partial<StatsigProject> = {}): StatsigProject => ({
  apiKey: 'console-aaaaaaaaaaaaaaaaaaaa',
  clientKeys: [],
  gateHashes: [],
  id: 'p1',
  label: 'Project 1',
  origins: [],
  ...overrides,
})

describe('projectsSettings component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    addProjectMock.mockResolvedValue('p9')
    contextState.detectedKeys = null
    contextState.projectMatch = null
    settingsState.activeProjectId = 'p1'
    settingsState.projects = [project()]
    settingsState.removeProject = removeProjectMock
    settingsState.updateProject = updateProjectMock
  })

  it('lists the configured projects with their detection data', () => {
    settingsState.projects = [
      project({ clientKeys: ['client-a', 'client-b'] }),
      project({ gateHashes: ['1'], id: 'p2', label: 'Project 2' }),
      project({ id: 'p3', label: 'Project 3', origins: ['https://app.example.com'] }),
    ]

    renderWithProviders(<ProjectsSettings />)

    expect(screen.getByText('2 client keys')).toBeInTheDocument()
    expect(screen.getByText('Gate fingerprint')).toBeInTheDocument()
    expect(screen.getByText('No detection data')).toBeInTheDocument()
    expect(screen.getByText('app.example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Project 1 is active' })).toBeInTheDocument()
  })

  it('shows how the active project was matched', () => {
    contextState.projectMatch = { projectId: 'p1', reason: 'hashed-key' }

    renderWithProviders(<ProjectsSettings />)

    expect(screen.getByText('Hashed SDK key matches this project')).toBeInTheDocument()
    expect(screen.getByText(/This page belongs to/iu)).toBeInTheDocument()
  })

  it('warns when the detected key belongs to no configured project', () => {
    settingsState.projects = [project({ clientKeys: ['client-a'] })]
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-unknown'] }
    contextState.projectMatch = null

    renderWithProviders(<ProjectsSettings />)

    expect(screen.getByText('client-unknown')).toBeInTheDocument()
  })

  it('explains that nothing can be compared while no project knows its own keys', () => {
    contextState.detectedKeys = { gateHashes: [], hashedSdkKeys: [], sdkKeys: ['client-unknown'] }
    contextState.projectMatch = null

    renderWithProviders(<ProjectsSettings />)

    expect(screen.queryByText('client-unknown')).not.toBeInTheDocument()
    expect(screen.getByText(/no project knows its own client keys or gates yet/iu)).toBeInTheDocument()
  })

  it('says when the page has no Statsig at all', () => {
    renderWithProviders(<ProjectsSettings />)

    expect(screen.getByText(/No Statsig SDK was detected on this page/iu)).toBeInTheDocument()
  })

  it('rejects a key that is not a Console API key', async () => {
    const { user } = renderWithProviders(<ProjectsSettings />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'client-nope')
    await user.click(screen.getByRole('button', { name: /Add/iu }))

    expect(screen.getByText('API key should start with "console-"')).toBeInTheDocument()
    expect(initialLogin).not.toHaveBeenCalled()
  })

  it('rejects a project that is already configured', async () => {
    const { user } = renderWithProviders(<ProjectsSettings />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'console-aaaaaaaaaaaaaaaaaaaa')
    await user.click(screen.getByRole('button', { name: /Add/iu }))

    expect(screen.getByText('That project is already configured')).toBeInTheDocument()
    expect(initialLogin).not.toHaveBeenCalled()
  })

  it('adds the project once Statsig accepts the key', async () => {
    vi.mocked(initialLogin).mockResolvedValue({ data: undefined, error: undefined, success: true })

    const { user } = renderWithProviders(<ProjectsSettings />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'console-new')
    await user.click(screen.getByRole('button', { name: /Add/iu }))

    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith('console-new', false)
    })
  })

  it('surfaces the error returned by Statsig', async () => {
    vi.mocked(initialLogin).mockResolvedValue({ data: undefined, error: 'Invalid key', success: false })

    const { user } = renderWithProviders(<ProjectsSettings />)

    await user.type(screen.getByLabelText('Statsig Console API Key'), 'console-bad{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Invalid key')).toBeInTheDocument()
    })
    expect(addProjectMock).not.toHaveBeenCalled()
  })

  it('activates a project and pins the current site to it', async () => {
    settingsState.projects = [project(), project({ id: 'p2', label: 'Project 2' })]

    const { user } = renderWithProviders(<ProjectsSettings />)
    await user.click(screen.getByRole('button', { name: 'Use Project 2' }))

    expect(switchProjectMock).toHaveBeenCalledWith('p2', true)
  })

  it('renames a project on blur and ignores an empty name', async () => {
    const { user } = renderWithProviders(<ProjectsSettings />)
    const input = screen.getByLabelText('Project name')

    await user.clear(input)
    await user.tab()
    expect(updateProjectMock).not.toHaveBeenCalled()

    await user.type(input, 'Qdrant Cloud')
    await user.tab()
    expect(updateProjectMock).toHaveBeenCalledWith('p1', { label: 'Qdrant Cloud' })
  })

  it('renames a project on Enter without submitting the settings form', async () => {
    const { user } = renderWithProviders(<ProjectsSettings />)
    const input = screen.getByLabelText('Project name')

    await user.clear(input)
    await user.type(input, 'Qdrant Cloud{Enter}')

    expect(updateProjectMock).toHaveBeenCalledWith('p1', { label: 'Qdrant Cloud' })
    expect(updateProjectMock).toHaveBeenCalledTimes(1)
  })

  it('refreshes and removes a project', async () => {
    refreshProjectMock.mockImplementation(async () => {})

    const { user } = renderWithProviders(<ProjectsSettings />)

    await user.click(screen.getByRole('button', { name: /Refresh detection data/iu }))
    expect(refreshProjectMock).toHaveBeenCalledWith('p1', 'console-aaaaaaaaaaaaaaaaaaaa')

    await user.click(screen.getByRole('button', { name: /Remove Project 1/iu }))
    expect(removeProjectMock).toHaveBeenCalledWith('p1')
  })
})
