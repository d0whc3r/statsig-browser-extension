import type { StatsigUser } from '@/src/types/statsig'

export const getDetectedUserId = (
  detectedUser?: StatsigUser,
  idType = 'userID',
): string | undefined => {
  if (!detectedUser) {
    return undefined
  }
  if (idType === 'userID') {
    const id = detectedUser.userID ?? detectedUser.id
    if (typeof id === 'string') {return id}
    if (typeof id === 'number' || typeof id === 'boolean') {return String(id)}
    return undefined
  }

  const { customIDs, custom } = detectedUser

  const customId = customIDs?.[idType]
  if (typeof customId === 'string') {return customId}

  const rootId = (detectedUser as Record<string, unknown>)[idType]
  if (typeof rootId === 'string') {return rootId}

  const cust = custom?.[idType]
  if (typeof cust === 'string') {return cust}

  return undefined
}
