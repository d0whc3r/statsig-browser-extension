import type { StatsigUser } from '@/src/types/statsig'

export const getDetectedUserId = (
  detectedUser: StatsigUser | undefined,
  idType = 'userID',
): string | undefined => {
  if (!detectedUser) {
    return undefined
  }

  if (idType === 'userID') {
    return (detectedUser.userID || detectedUser.id) as string | undefined
  }

  // Check for customIDs
  const customIDs = detectedUser.customIDs as Record<string, string> | undefined
  if (customIDs && typeof customIDs === 'object' && idType in customIDs) {
    return customIDs[idType]
  }

  // Check top level
  if (idType in detectedUser) {
    return detectedUser[idType] as string
  }

  return undefined
}
