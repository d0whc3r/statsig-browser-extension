import type { StatsigUser } from '@/src/types/statsig'

export const getDetectedUserId = (
  detectedUser?: StatsigUser,
  idType = 'userID',
): string | undefined => {
  if (!detectedUser) {
    return undefined
  }
  if (idType === 'userID') {
    return (detectedUser.userID || detectedUser.id) as string | undefined
  }

  const { customIDs, custom } = detectedUser

  return (
    (typeof customIDs?.[idType] === 'string' ? customIDs[idType] : undefined) ??
    (typeof detectedUser[idType] === 'string' ? detectedUser[idType] : undefined) ??
    (typeof custom?.[idType] === 'string' ? custom[idType] : undefined)
  )
}
