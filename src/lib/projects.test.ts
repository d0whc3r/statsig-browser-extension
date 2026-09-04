import { describe, expect, it } from 'vitest'

import type { DetectedStatsigKeys, ProjectMatch, StatsigProject } from './projects'

import { djb2 } from './djb2'
import { createProject, findProject, getProjectDetection, hasDetectedKeys, matchProject } from './projects'

const project = (overrides: Partial<StatsigProject> = {}): StatsigProject => ({
  apiKey: 'console-a',
  clientKeys: [],
  gateHashes: [],
  id: 'p1',
  label: 'Project 1',
  origins: [],
  ...overrides,
})

const detected = (overrides: Partial<DetectedStatsigKeys> = {}): DetectedStatsigKeys => ({
  gateHashes: [],
  hashedSdkKeys: [],
  sdkKeys: [],
  ...overrides,
})

describe('createProject', () => {
  it('creates an empty project with a unique id', () => {
    const first = createProject('console-a', 'Project 1')
    const second = createProject('console-b', 'Project 2')

    expect(first).toMatchObject({
      apiKey: 'console-a',
      clientKeys: [],
      gateHashes: [],
      label: 'Project 1',
      origins: [],
    })
    expect(first.id).not.toBe(second.id)
  })
})

const noId: string | undefined = undefined
const noKeys: DetectedStatsigKeys | undefined = undefined
const noMatch: ProjectMatch | undefined = undefined

describe('findProject', () => {
  it('returns the project with the given id', () => {
    const projects = [project(), project({ id: 'p2' })]

    expect(findProject(projects, 'p2')?.id).toBe('p2')
    expect(findProject(projects, 'missing')).toBeUndefined()
    expect(findProject(projects, noId)).toBeUndefined()
  })
})

describe('hasDetectedKeys', () => {
  it('only reports keys that can identify a project', () => {
    expect(hasDetectedKeys(noKeys)).toBeFalsy()
    expect(hasDetectedKeys(null)).toBeFalsy()
    expect(hasDetectedKeys(detected())).toBeFalsy()
    expect(hasDetectedKeys(detected({ gateHashes: ['1', '2'] }))).toBeFalsy()
    expect(hasDetectedKeys(detected({ sdkKeys: ['client-a'] }))).toBeTruthy()
    expect(hasDetectedKeys(detected({ hashedSdkKeys: ['123'] }))).toBeTruthy()
  })
})

describe('matchProject', () => {
  it('returns null when nothing was detected', () => {
    expect(matchProject([project()], noKeys)).toBeNull()
    expect(matchProject([project()], detected())).toBeNull()
  })

  it('prefers an origin pinned by the user over the detected keys', () => {
    const pinned = project({ id: 'p2', origins: ['https://app.example.com'] })
    const projects = [project({ clientKeys: ['client-a'] }), pinned]

    expect(matchProject(projects, detected({ sdkKeys: ['client-a'] }), 'https://app.example.com')).toStrictEqual({
      projectId: 'p2',
      reason: 'origin',
    })
  })

  it('matches an exact client SDK key', () => {
    const projects = [project(), project({ clientKeys: ['client-b'], id: 'p2' })]

    expect(matchProject(projects, detected({ sdkKeys: ['client-b'] }), 'https://other.example.com')).toStrictEqual({
      projectId: 'p2',
      reason: 'client-key',
    })
  })

  it('matches a bootstrapped page through the hashed SDK key', () => {
    const projects = [project({ clientKeys: ['client-b'], id: 'p2' })]

    const pageKeys = detected({ hashedSdkKeys: [djb2('client-b')] })

    expect(matchProject(projects, pageKeys)).toStrictEqual({
      projectId: 'p2',
      reason: 'hashed-key',
    })
  })

  it('falls back to the gate fingerprint and keeps the best overlap', () => {
    const pageHashes = ['1', '2', '3', '4']
    const projects = [
      project({ gateHashes: ['1', '2', '3'], id: 'weak' }),
      project({ gateHashes: pageHashes, id: 'strong' }),
    ]

    expect(matchProject(projects, detected({ gateHashes: pageHashes }))).toStrictEqual({
      projectId: 'strong',
      reason: 'fingerprint',
    })
  })

  it('ignores a fingerprint with too few or too sparse matches', () => {
    const twoOfFour = project({ gateHashes: ['1', '2'] })
    expect(matchProject([twoOfFour], detected({ gateHashes: ['1', '2', '3', '4'] }))).toBeNull()

    const halfOfSix = project({ gateHashes: ['1', '2', '3', 'x', 'y', 'z'] })
    const sixPageHashes = detected({ gateHashes: ['1', '2', '3', 'a', 'b', 'c'] })
    expect(matchProject([halfOfSix], sixPageHashes)).toStrictEqual({ projectId: 'p1', reason: 'fingerprint' })

    const oneOfSix = project({ gateHashes: ['1', '2', 'x', 'y', 'z', 'w'] })
    expect(matchProject([oneOfSix], sixPageHashes)).toBeNull()
  })

  it('matches a project whose gate list is only partially known', () => {
    // The Console API returns at most 100 gates, so the page usually exposes more than the project sample
    const sampled = project({ gateHashes: ['1', '2', '3'] })
    const pageHashes = detected({ gateHashes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] })

    expect(matchProject([sampled], pageHashes)).toStrictEqual({ projectId: 'p1', reason: 'fingerprint' })
  })

  it('returns null when the detected key belongs to an unconfigured project', () => {
    const projects = [project({ clientKeys: ['client-a'], gateHashes: ['1', '2', '3'] })]

    expect(matchProject(projects, detected({ sdkKeys: ['client-unknown'] }))).toBeNull()
  })
})

describe('getProjectDetection', () => {
  const knownProject = project({ clientKeys: ['client-a'] })

  it('reports the signal that linked the page to the active project', () => {
    const match = { projectId: 'p1', reason: 'client-key' } as const

    expect(getProjectDetection([knownProject], detected({ sdkKeys: ['client-a'] }), match)).toStrictEqual({
      reason: 'client-key',
      status: 'matched',
    })
  })

  it('reports a page whose key belongs to no configured project', () => {
    expect(getProjectDetection([knownProject], detected({ sdkKeys: ['client-b'] }), null)).toStrictEqual({
      status: 'unknown-project',
    })
  })

  it('reports that nothing can be compared while no project knows its own keys', () => {
    expect(getProjectDetection([project()], detected({ sdkKeys: ['client-b'] }), null)).toStrictEqual({
      status: 'unverifiable',
    })
  })

  it('reports a page without Statsig', () => {
    expect(getProjectDetection([knownProject], null, null)).toStrictEqual({ status: 'no-statsig' })
    expect(getProjectDetection([knownProject], detected(), null)).toStrictEqual({ status: 'no-statsig' })
  })

  it('stays pending until the page has been inspected and matched', () => {
    expect(getProjectDetection([knownProject], noKeys, noMatch)).toStrictEqual({ status: 'pending' })
    expect(getProjectDetection([knownProject], noKeys, null)).toStrictEqual({ status: 'pending' })
    expect(getProjectDetection([knownProject], detected({ sdkKeys: ['client-a'] }), noMatch)).toStrictEqual({
      status: 'pending',
    })
  })
})
