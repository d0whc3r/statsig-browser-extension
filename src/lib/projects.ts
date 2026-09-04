import { djb2 } from '@/src/lib/djb2'

/** A Statsig project managed by the extension, identified by its Console API key. */
export interface StatsigProject {
  id: string
  label: string
  apiKey: string
  /** CLIENT SDK keys of the project (empty when the Console key lacks the `can_access_keys` scope). */
  clientKeys: string[]
  /** Hashes (djb2) of the project's gate names, used to fingerprint a page when `clientKeys` is empty. */
  gateHashes: string[]
  /** Origins pinned to this project by the user. */
  origins: string[]
}

/** Statsig identifiers found on the inspected page. */
export interface DetectedStatsigKeys {
  /** Client SDK keys read from the SDK instances on the page. */
  sdkKeys: string[]
  /** Values of `hashed_sdk_key_used`, i.e. `djb2(clientKey)`, from the evaluation payloads. */
  hashedSdkKeys: string[]
  /** Hashes (djb2) of the gate names present in the evaluation payloads. */
  gateHashes: string[]
}

export type ProjectMatchReason = 'client-key' | 'fingerprint' | 'hashed-key' | 'origin'

export interface ProjectMatch {
  projectId: string
  reason: ProjectMatchReason
}

/**
 * A fingerprint match needs this many gates in common, and that overlap has to cover this share of
 * the smaller of the two gate lists — the Console API only returns the project's first 100 gates,
 * so a big project would never cover a whole page payload.
 */
const MIN_FINGERPRINT_MATCHES = 3
const MIN_FINGERPRINT_RATIO = 0.5

/** User-facing wording for the signal that resolved a match. */
export const MATCH_REASON_LABELS: Record<ProjectMatchReason, string> = {
  'client-key': 'SDK key matches this project',
  fingerprint: 'Gates match this project',
  'hashed-key': 'Hashed SDK key matches this project',
  origin: 'Pinned to this site',
}

export const createProject = (apiKey: string, label: string): StatsigProject => ({
  apiKey,
  clientKeys: [],
  gateHashes: [],
  id: globalThis.crypto.randomUUID(),
  label,
  origins: [],
})

export const findProject = (projects: StatsigProject[], projectId: string | undefined) =>
  projects.find((project) => project.id === projectId)

export const hasDetectedKeys = (detected: DetectedStatsigKeys | null | undefined) =>
  Boolean(detected && (detected.sdkKeys.length > 0 || detected.hashedSdkKeys.length > 0))

/** Whether a project knows enough about itself to be recognised on a page. */
export const hasProjectFingerprint = (project: StatsigProject) =>
  project.clientKeys.length > 0 || project.gateHashes.length > 0

export type ProjectDetectionStatus = 'matched' | 'no-statsig' | 'pending' | 'unknown-project' | 'unverifiable'

export interface ProjectDetection {
  status: ProjectDetectionStatus
  reason?: ProjectMatchReason
}

/**
 * Turns the raw detection into the single question the user cares about: does this page belong to
 * the Console API key in use?
 *
 * - `matched`: the page's Statsig key belongs to the active project (see `reason`)
 * - `pending`: the page has not been inspected yet, so nothing is decided
 * - `unknown-project`: the page uses Statsig, but none of the configured keys owns it
 * - `unverifiable`: the page uses Statsig and no project knows its own client keys or gates yet,
 *   so nothing can be compared
 * - `no-statsig`: no Statsig SDK was found on the page
 *
 * Only `matched` may load project data: on every other outcome the page belongs to an unknown
 * project, so showing another project's gates would be plain wrong.
 *
 * @param projects - Projects configured in the extension
 * @param detected - Statsig identifiers found on the page
 * @param match - Result of {@link matchProject}
 * @returns The detection status and, when matched, the signal that resolved it
 */
export const getProjectDetection = (
  projects: StatsigProject[],
  detected: DetectedStatsigKeys | null | undefined,
  match: ProjectMatch | null | undefined,
): ProjectDetection => {
  if (match) {
    return { reason: match.reason, status: 'matched' }
  }
  // `undefined` means the page has not been read yet, `null` means it was read and had nothing.
  if (detected === undefined || match === undefined) {
    return { status: 'pending' }
  }
  if (!hasDetectedKeys(detected)) {
    return { status: 'no-statsig' }
  }
  const canCompare = projects.some((project) => hasProjectFingerprint(project))
  return { status: canCompare ? 'unknown-project' : 'unverifiable' }
}

const countCommon = (values: string[], others: string[]) => {
  const set = new Set(others)
  return values.reduce((total, value) => (set.has(value) ? total + 1 : total), 0)
}

const matchByClientKey = (projects: StatsigProject[], sdkKeys: string[]) =>
  projects.find((project) => countCommon(project.clientKeys, sdkKeys) > 0)

const matchByHashedKey = (projects: StatsigProject[], hashedSdkKeys: string[]) =>
  projects.find(
    (project) =>
      countCommon(
        project.clientKeys.map((key) => djb2(key)),
        hashedSdkKeys,
      ) > 0,
  )

const fingerprintRatio = (common: number, gateHashes: string[], project: StatsigProject) =>
  common / Math.min(gateHashes.length, project.gateHashes.length)

const matchByFingerprint = (projects: StatsigProject[], gateHashes: string[]) => {
  const ranked =
    gateHashes.length === 0
      ? []
      : projects
          .map((project) => ({ common: countCommon(gateHashes, project.gateHashes), project }))
          .filter(
            ({ common, project }) =>
              common >= MIN_FINGERPRINT_MATCHES &&
              fingerprintRatio(common, gateHashes, project) >= MIN_FINGERPRINT_RATIO,
          )
          .toSorted((first, second) => second.common - first.common)

  return ranked[0]?.project
}

const MATCHERS: {
  reason: ProjectMatchReason
  resolve: (projects: StatsigProject[], detected: DetectedStatsigKeys) => StatsigProject | undefined
}[] = [
  { reason: 'client-key', resolve: (projects, detected) => matchByClientKey(projects, detected.sdkKeys) },
  { reason: 'hashed-key', resolve: (projects, detected) => matchByHashedKey(projects, detected.hashedSdkKeys) },
  { reason: 'fingerprint', resolve: (projects, detected) => matchByFingerprint(projects, detected.gateHashes) },
]

/**
 * Resolves which stored project the inspected page belongs to, cheapest signal first:
 * an origin pinned by the user, an exact client SDK key, its djb2 hash (bootstrapped pages),
 * and finally the overlap between the page's gate hashes and the project's gate names.
 *
 * @param projects - Projects configured in the extension
 * @param detected - Statsig identifiers found on the page
 * @param origin - Origin of the inspected page
 * @returns The matching project and the signal that resolved it, or `null` when undecided
 */
export const matchProject = (
  projects: StatsigProject[],
  detected: DetectedStatsigKeys | null | undefined,
  origin?: string,
): ProjectMatch | null => {
  const pinned = origin ? projects.find((project) => project.origins.includes(origin)) : undefined
  if (pinned) {
    return { projectId: pinned.id, reason: 'origin' }
  }

  if (!detected) {
    return null
  }

  for (const matcher of MATCHERS) {
    const project = matcher.resolve(projects, detected)
    if (project) {
      return { projectId: project.id, reason: matcher.reason }
    }
  }

  return null
}
