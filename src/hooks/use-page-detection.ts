import { useDetectedStatsigKeys } from '@/src/hooks/use-detected-statsig-keys'
import { useDetectedUser } from '@/src/hooks/use-detected-user'
import { useProjectMatching } from '@/src/hooks/use-project-matching'
import { useBackfillProjectFingerprints } from '@/src/hooks/use-projects'

/**
 * Everything the popup needs to know about the page it is inspecting: its Statsig user, the keys
 * that identify its project, and which configured project those keys belong to.
 *
 * @returns The retry callback of the user detection
 */
export const usePageDetection = () => {
  const { retryDetection } = useDetectedUser()
  useDetectedStatsigKeys()
  useBackfillProjectFingerprints()
  useProjectMatching()

  return { retryDetection }
}
