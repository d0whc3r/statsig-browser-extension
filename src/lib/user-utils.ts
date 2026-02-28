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

  const { customIDs, custom } = (detectedUser || {}) as {
    customIDs?: Record<string, string>
    custom?: Record<string, unknown>
  }

  return (
    (typeof customIDs?.[idType] === 'string' ? customIDs[idType] : undefined) ??
    (typeof detectedUser[idType] === 'string' ? (detectedUser[idType] as string) : undefined) ??
    (typeof custom?.[idType] === 'string' ? (custom[idType] as string) : undefined)
  )
}
